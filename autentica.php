<?php
// Iniciar a sessão
session_start();

// Conexão com o banco de dados
$conexao = mysqli_connect("localhost", "root", "", "teste");

// Verificar conexão
if (!$conexao) {
    die("Erro ao conectar no banco de dados: " . mysqli_connect_error());
}

// Validar se os dados foram enviados pelo formulário
if (isset($_POST['email'], $_POST['senha'])) {
    $email = mysqli_real_escape_string($conexao, $_POST['email']);
    $senha = $_POST['senha'];

    // Buscar usuário pelo e-mail
    $sql = "SELECT * FROM dados WHERE email = '$email'";
    $resultado = mysqli_query($conexao, $sql);

    if ($resultado && mysqli_num_rows($resultado) > 0) {
        $usuario = mysqli_fetch_assoc($resultado);

        // Verificar a senha
        if (password_verify($senha, $usuario['senha'])) {
            // Armazenar dados do usuário na sessão
            $_SESSION['usuario'] = $usuario['id'];

            // Login bem-sucedido, redirecionar para o site
            header("Location: /Projeto%20Planilha/site.html");
            exit();
        } else {
            echo "Senha incorreta!";
        }
    } else {
        header("Location: /Projeto%20Planilha/error.html");
        exit();
    }
} else {
    echo "Dados não enviados.";
}

// Fechar conexão com o banco de dados
mysqli_close($conexao);
?>
