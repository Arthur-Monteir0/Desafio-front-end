$(function () {
  const ANEXOS_KEY = "desafio_anexos_v1";
  const $tableProdutos = $("#tableProdutos tbody");
  const $tableAnexos = $("#tableAnexos tbody");

  let anexos = loadAnexosFromSession();
  renderAnexosTable();
  addProdutoRow();

  // Máscaras simples
  $("#cep").on("input", function () {
    let v = $(this).val().replace(/\D/g, "");
    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, "$1-$2");
    $(this).val(v);
  });

  $("#cnpj").on("input", function () {
    let v = $(this).val().replace(/\D/g, "").slice(0, 14);
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
    $(this).val(v);
  });

  $("#telefone").on("input", function () {
    let v = $(this).val().replace(/\D/g, "").slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    if (v.length > 10) v = v.replace(/(\d{5})(\d)/, "$1-$2");
    else v = v.replace(/(\d{4})(\d)/, "$1-$2");
    $(this).val(v);
  });

  // Busca CEP
  $("#cep").on("blur", function () {
    const cep = $(this).val().replace(/\D/g, "");
    if (cep.length !== 8) return;
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.erro) {
          alert("CEP não encontrado.");
          return;
        }
        $("#endereco").val(
          `${data.logradouro} ${data.bairro ? "- " + data.bairro : ""} ${
            data.localidade ? " - " + data.localidade : ""
          } ${data.uf ? "/" + data.uf : ""}`.trim()
        );
      })
      .catch((err) => {
        console.error("Erro ao buscar CEP", err);
      });
  });

  // Produtos
  $("#btnAddProduto").on("click", () => addProdutoRow());

  // Anexos
  $("#btnPickAnexo").on("click", () => $("#inputAnexo").click());
  $("#inputAnexo").on("change", function (e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (ev) {
        const base64 = ev.target.result.split(",")[1];
        const item = {
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          base64,
        };
        anexos.push(item);
        saveAnexosToSession();
        renderAnexosTable();
      };
      reader.readAsDataURL(file);
    });
    $(this).val("");
  });

  // Salvar
  $("#btnSalvar").on("click", function (e) {
    e.preventDefault();
    $("#formFornecedor").addClass("was-validated");

    if (!validateForm()) return;

    const produtos = gatherProdutos();
    if (produtos.length === 0) {
      alert("Adicione pelo menos 1 produto.");
      return;
    }
    if (anexos.length === 0) {
      alert("Adicione pelo menos 1 documento.");
      return;
    }

    $("#modalLoading").modal("show");

    const payload = {
      razaoSocial: $("#razaoSocial").val().trim(),
      nomeFantasia: $("#nomeFantasia").val().trim(),
      cnpj: $("#cnpj").val().trim(),
      inscricaoEstadual: $("#inscEstadual").val().trim(),
      inscricaoMunicipal: $("#inscMunicipal").val().trim(),
      cep: $("#cep").val().trim(),
      endereco: $("#endereco").val().trim(),
      numero: $("#numero").val().trim(),
      pessoaContato: $("#contato").val().trim(),
      telefone: $("#telefone").val().trim(),
      email: $("#email").val().trim(),
      produtos,
      anexos: anexos.map((a) => ({
        id: a.id,
        name: a.name,
        size: a.size,
        type: a.type,
      })),
    };

    setTimeout(() => {
      console.log("JSON a ser enviado:", payload);
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fornecedor_${sanitizeFilename(
        payload.razaoSocial || "export"
      )}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      $("#modalLoading").modal("hide");
      alert("Dados prontos (JSON no console e arquivo baixado).");
    }, 900);
  });

  // Funções auxiliares
  function validateForm() {
    const form = document.getElementById("formFornecedor");
    return form.checkValidity();
  }

  function generateId() {
    return "id_" + Math.random().toString(36).substr(2, 9);
  }

  function sanitizeFilename(s) {
    return s.replace(/[^\w\d_\-]+/g, "_").slice(0, 60);
  }

  function formatMoneyBRL(n) {
    const num = Number(n) || 0;
    return num
      .toFixed(2)
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function parseMoneyBRL(str) {
    if (!str) return 0;
    const cleaned = String(str).replace(/\./g, "").replace(",", ".");
    return Number(cleaned) || 0;
  }

  function addProdutoRow(data = {}) {
    const id = generateId();
    const desc = data.descricao || "";
    const unidade = data.unidade || "";
    const qtd = data.quantidade || "";
    const valor = data.valorUnitario
      ? Number(data.valorUnitario).toFixed(2)
      : "";

    const $row = $(`
      <tr data-id="${id}">
        <td><input type="text" class="form-control form-control-sm descricao" value="${escapeHtml(
          desc
        )}" required></td>
        <td><input type="text" class="form-control form-control-sm unidade" value="${escapeHtml(
          unidade
        )}" required></td>
        <td><input type="number" min="0" step="1" class="form-control form-control-sm quantidade" value="${escapeHtml(
          qtd
        )}" required></td>
        <td><input type="text" class="form-control form-control-sm valorUnitario" value="${
          valor ? formatMoneyBRL(valor) : ""
        }" required></td>
        <td><input type="text" class="form-control form-control-sm valorTotal" disabled></td>
        <td class="text-center">
          <button type="button" class="btn btn-sm btn-danger btnExcluirProduto" title="Excluir">🗑️</button>
        </td>
      </tr>
    `);

    $row.find(".quantidade, .valorUnitario").on("input", function () {
      recalcRow($row);
    });

    $row.find(".valorUnitario").on("blur", function () {
      const parsed = parseMoneyBRL($(this).val());
      $(this).val(parsed ? formatMoneyBRL(parsed) : "");
      recalcRow($row);
    });

    $row.find(".btnExcluirProduto").on("click", function () {
      $row.remove();
    });

    $tableProdutos.append($row);
    recalcRow($row);
  }

  function recalcRow($row) {
    const qtd = Number($row.find(".quantidade").val()) || 0;
    const valor = parseMoneyBRL($row.find(".valorUnitario").val());
    const total = preciseMultiply(qtd, valor);
    $row.find(".valorTotal").val(formatMoneyBRL(total));
  }

  function preciseMultiply(a, b) {
    const aCents = Math.round((Number(a) || 0) * 100);
    const bCents = Math.round((Number(b) || 0) * 100);
    return (aCents * bCents) / 10000;
  }

  function gatherProdutos() {
    const produtos = [];
    $tableProdutos.find("tr").each(function () {
      const $r = $(this);
      const descricao = $r.find(".descricao").val().trim();
      const unidade = $r.find(".unidade").val().trim();
      const quantidade = Number($r.find(".quantidade").val()) || 0;
      const valorUnitario = parseMoneyBRL($r.find(".valorUnitario").val());
      const valorTotal = parseMoneyBRL($r.find(".valorTotal").val());
      if (descricao && unidade && quantidade > 0 && valorUnitario >= 0) {
        produtos.push({
          descricao,
          unidade,
          quantidade,
          valorUnitario,
          valorTotal,
        });
      }
    });
    return produtos;
  }

  function renderAnexosTable() {
    $tableAnexos.empty();
    if (anexos.length === 0) {
      $tableAnexos.append(
        '<tr><td colspan="3" class="text-center text-muted">Nenhum documento adicionado.</td></tr>'
      );
      return;
    }
    anexos.forEach((a) => {
      const sizeKb = (a.size / 1024).toFixed(1) + " KB";
      const $tr = $(`
        <tr data-id="${a.id}">
          <td>${escapeHtml(a.name)}</td>
          <td>${sizeKb}</td>
          <td class="text-center">
            <button type="button" class="btn btn-sm btn-info btnView" title="Visualizar">🔍</button>
            <button type="button" class="btn btn-sm btn-danger btnDel" title="Excluir">🗑️</button>
          </td>
        </tr>
      `);
      $tr.find(".btnDel").on("click", function () {
        if (!confirm("Excluir este documento?")) return;
        anexos = anexos.filter((x) => x.id !== a.id);
        saveAnexosToSession();
        renderAnexosTable();
      });
      $tr.find(".btnView").on("click", function () {
        const byteString = atob(a.base64);
        const ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++)
          ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ia], {
          type: a.type || "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = a.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      });
      $tableAnexos.append($tr);
    });
  }

  function saveAnexosToSession() {
    try {
      sessionStorage.setItem(ANEXOS_KEY, JSON.stringify(anexos));
    } catch (e) {
      console.error("Erro ao salvar anexos", e);
      alert("Não foi possível salvar anexos na sessão.");
    }
  }

  function loadAnexosFromSession() {
    try {
      const data = sessionStorage.getItem(ANEXOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Erro ao carregar anexos", e);
      return [];
    }
  }

  function escapeHtml(text) {
    return String(text || "").replace(/[&<>"'`]/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "`": "&#96;",
      }[m];
    });
  }
});
