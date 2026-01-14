<?php
// public/upload.php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// 1. Verifica se houve envio de arquivo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['imagem'])) {
    
    $arquivo = $_FILES['imagem'];
    
    // 2. Validações básicas (apenas imagens)
    $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
    $permitidos = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (!in_array($extensao, $permitidos)) {
        echo json_encode(['sucesso' => false, 'erro' => 'Apenas imagens JPG, PNG ou WEBP.']);
        exit;
    }

    // 3. Cria pasta de uploads se não existir
    $pastaUploads = 'uploads/';
    if (!is_dir($pastaUploads)) {
        mkdir($pastaUploads, 0755, true);
    }
a<?php
// Arquivo: public/upload.php

// Permite que o React envie dados
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Verifica se enviaram um arquivo chamado 'imagem'
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['imagem'])) {
    
    $arquivo = $_FILES['imagem'];
    $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
    
    // Cria a pasta 'uploads' se ela não existir
    if (!is_dir('uploads')) {
        mkdir('uploads', 0755, true);
    }

    // Gera um nome único para a imagem (ex: logo-65a1b2c3.png)
    $novoNome = 'logo-' . uniqid() . '.' . $extensao;
    $caminhoFinal = 'uploads/' . $novoNome;

    // Tenta mover o arquivo para a pasta uploads
    if (move_uploaded_file($arquivo['tmp_name'], $caminhoFinal)) {
        
        // Descobre o endereço do site automaticamente (http ou https)
        $protocolo = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
        $dominio = $_SERVER['HTTP_HOST'];
        
        // Cria o link final
        $linkCompleto = "$protocolo://$dominio/$caminhoFinal";
        
        echo json_encode(['sucesso' => true, 'link' => $linkCompleto]);
    } else {
        echo json_encode(['sucesso' => false, 'erro' => 'Falha ao salvar o arquivo. Verifique permissões da pasta uploads.']);
    }

} else {
    echo json_encode(['sucesso' => false, 'erro' => 'Nenhuma imagem recebida.']);
}
?>
    // 4. Gera nome único para não sobrescrever
    $novoNome = uniqid() . '.' . $extensao;
    $caminhoFinal = $pastaUploads . $novoNome;

    // 5. Move o arquivo
    if (move_uploaded_file($arquivo['tmp_name'], $caminhoFinal)) {
        // Pega o protocolo (http ou https) e o domínio atual
        $protocolo = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
        $dominio = $_SERVER['HTTP_HOST'];
        
        // Retorna o link completo
        $linkCompleto = "$protocolo://$dominio/$caminhoFinal";
        
        echo json_encode(['sucesso' => true, 'link' => $linkCompleto]);
    } else {
        echo json_encode(['sucesso' => false, 'erro' => 'Falha ao salvar no servidor.']);
    }

} else {
    echo json_encode(['sucesso' => false, 'erro' => 'Nenhum arquivo enviado.']);
}
?>