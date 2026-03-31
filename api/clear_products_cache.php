<?php
require_once __DIR__ . '/../includes/file_cache.php';

echo "Clearing cache...\n";
$count = $cache->clearAll();
echo "Cleared $count cache files.\n";
?>
