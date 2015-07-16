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
        if (!$_FILES
            || $_FILES['file']['error'] > 0
            || !is_uploaded_file($_FILES['file']['tmp_name'])
        ){
            return 0;
        }
        $tmpPath = self::$tmp . DIRECTORY_SEPARATOR . $userID;
        if(!is_dir($tmpPath))
        {
            mkdir($tmpPath, 0777, true);
        }
        $tmpFile = $tmpPath . DIRECTORY_SEPARATOR . $fileName;
        file_put_contents($tmpFile, $_FILES['file']['tmp_name'], FILE_APPEND);
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