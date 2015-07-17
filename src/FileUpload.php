<?php

namespace FileUpload;


/**
 * Class FileUpload
 *
 * @package Application\Classes
 * @author  Xuman
 * @version $Id$
 */
class FileUpload
{
    static $tmp = 'data/upload/tmp';
    static function saveTo($path)
    {
        if (!$_FILES
            || $_FILES['file']['error'] > 0
            || !is_uploaded_file($_FILES['file']['tmp_name'])
        ){
            return 0;
        }
        $forRef = explode(".", $_FILES['file']['name']);
        $ext = array_pop($forRef);
        $storeName = md5_file($_FILES['file']['name']);
        move_uploaded_file(
            $_FILES['file']['tmp_name'], rtrim($path, "\\/") . DIRECTORY_SEPARATOR . $storeName . '.' . $ext
        );
        return $storeName;
    }

    static function saveSplitFileTo($path, $userID, $fileName, $ext, $isComplete)
    {
        $tmpPath = self::$tmp . DIRECTORY_SEPARATOR . $userID;
        $tmpFile = $tmpPath . DIRECTORY_SEPARATOR . $fileName;
        if (!$_FILES
            || $_FILES['file']['error'] > 0
            || !is_uploaded_file($_FILES['file']['tmp_name'])
        ){
            if(is_file($tmpFile)) {
                unlink($tmpFile);
            }
            return 0;
        }
        if(!is_dir($tmpPath))
        {
            mkdir($tmpPath, 0777, true);
        }

        file_put_contents($tmpFile, file_get_contents($_FILES['file']['tmp_name']), FILE_APPEND);
        if($isComplete)
        {
            $storeName = md5_file($tmpFile);
            rename($tmpFile, rtrim($path, "\\/") . DIRECTORY_SEPARATOR . $storeName . '.' . $ext);
            @rmdir($tmpPath);
            return $storeName;
        }
        return '';
    }
    static function piecesSaveTo($path, $userID, $post)
    {
        if(!is_dir($path)) {
            mkdir($path, 0777, true);
        }
        $forRef = explode(".", $post['fileName']);
        $ext = array_pop($forRef);
        $fileID = $post['fileId'];
        $isComplete = $post['isComplete'];
        return self::saveSplitFileTo($path,$userID,$fileID . '.'. $ext, $ext, $isComplete);

    }

    static function getSessionId()
    {
        if(session_id() == '')
        {
            session_start();
        }
        return session_id();
    }
} 