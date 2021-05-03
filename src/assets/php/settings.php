<?php
require_once __DIR__ . '/../../../../api/account/accountFunctions.php';
require_once __DIR__ . '/../../../../api/database/databaseHelper.php';
require_once __DIR__ . '/../../../../api/database/readie/stream_tools.php';
require_once __DIR__ . '/../../../../api/returnData.php';

class Settings
{
    public function __construct(array $_request)
    {
        echo json_encode($this->ProcessRequest($_request));
    }

    private function ProcessRequest(array $_request)
    {
        if (!isset($_request['q'])) { return new ReturnData('NO_QUERY_FOUND', true); }

        $query = json_decode($_request['q'], true);
    
        if (!isset($query['method'])) { return new ReturnData('NO_METHOD_FOUND', true); }
        if (!isset($query['data'])) { return new ReturnData('NO_DATA_FOUND', true); }

        switch ($query['method'])
        {
            default:
                return new ReturnData('INVALID_METHOD', true);
        }
    }
}
new Settings($_GET);
//new Settings($_POST);