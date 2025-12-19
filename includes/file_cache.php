<?php
/**
 * File-Based Cache Helper
 * Simple caching without Redis dependency
 */

class FileCache {
    private $cacheDir;
    
    public function __construct($cacheDir = null) {
        $this->cacheDir = $cacheDir ?: dirname(__DIR__) . '/cache';
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    /**
     * Generate cache file path from key
     */
    private function getFilePath($key) {
        $safeKey = md5($key);
        return $this->cacheDir . '/' . $safeKey . '.cache';
    }
    
    /**
     * Get cached value
     * @param string $key Cache key
     * @return mixed|null Cached value or null if not found/expired
     */
    public function get($key) {
        $filePath = $this->getFilePath($key);
        
        if (!file_exists($filePath)) {
            return null;
        }
        
        $content = file_get_contents($filePath);
        $data = json_decode($content, true);
        
        if (!$data || !isset($data['expires']) || !isset($data['value'])) {
            return null;
        }
        
        // Check expiration
        if ($data['expires'] < time()) {
            unlink($filePath);
            return null;
        }
        
        return $data['value'];
    }
    
    /**
     * Set cached value
     * @param string $key Cache key
     * @param mixed $value Value to cache
     * @param int $ttl Time to live in seconds (default 5 minutes)
     * @return bool Success
     */
    public function set($key, $value, $ttl = 300) {
        $filePath = $this->getFilePath($key);
        
        $data = [
            'expires' => time() + $ttl,
            'value' => $value,
            'created' => date('Y-m-d H:i:s')
        ];
        
        return file_put_contents($filePath, json_encode($data)) !== false;
    }
    
    /**
     * Delete cached value
     * @param string $key Cache key
     * @return bool Success
     */
    public function delete($key) {
        $filePath = $this->getFilePath($key);
        
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        
        return true;
    }
    
    /**
     * Delete all cached values matching a pattern
     * @param string $pattern Key pattern (uses simple string matching)
     * @return int Number of deleted files
     */
    public function deletePattern($pattern) {
        $count = 0;
        $files = glob($this->cacheDir . '/*.cache');
        
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);
            
            // For pattern matching, we'd need to store the original key
            // For now, just delete all if pattern is '*'
            if ($pattern === '*') {
                unlink($file);
                $count++;
            }
        }
        
        return $count;
    }
    
    /**
     * Clear all expired cache files
     * @return int Number of cleared files
     */
    public function clearExpired() {
        $count = 0;
        $files = glob($this->cacheDir . '/*.cache');
        
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);
            
            if (!$data || !isset($data['expires']) || $data['expires'] < time()) {
                unlink($file);
                $count++;
            }
        }
        
        return $count;
    }
    
    /**
     * Clear all cache
     * @return int Number of cleared files
     */
    public function clearAll() {
        $count = 0;
        $files = glob($this->cacheDir . '/*.cache');
        
        foreach ($files as $file) {
            unlink($file);
            $count++;
        }
        
        return $count;
    }
}

// Global cache instance
$cache = new FileCache();
?>
