<?php
// predict_data.php
header('Content-Type: application/json');

$python = 'py';  // Windows Python launcher
$script = __DIR__ . '/predict.py';

$command = escapeshellcmd("$python " . escapeshellarg($script)) . ' 2>&1';
$output = shell_exec($command);

$output = trim($output ?? '');

if (empty($output)) {
    echo json_encode(['error' => 'No output from Python']);
    exit;
}

$json = json_decode($output);
if ($json === null) {
    echo json_encode([
        'error' => 'Invalid JSON',
        'raw' => substr($output, 0, 300)
    ]);
} else {
    echo $output;
}
?>