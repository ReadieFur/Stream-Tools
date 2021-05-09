<?php
//This patch for the new API is not ideal at all, however I plan to rewrite this entire webapp at some point so it will do for now.

require_once __DIR__ . '/../../../../api/account/accountFunctions.php';
require_once __DIR__ . '/../../../../api/database/databaseHelper.php';
require_once __DIR__ . '/../../../../api/database/readie/stream_tools.php';
require_once __DIR__ . '/../../../../api/returnData.php';

$query = json_decode($_POST['q'], true);
$response = new stdClass();

$sessionValid = AccountFunctions::VerifySession();

if (!$sessionValid->error && $sessionValid->data === true)
{
    $stream_tools = new stream_tools(true);
    $unid = $_COOKIE['READIE_UID'];

    if (isset($query['get_all']))
    {
        $result = $stream_tools->Select(array('unid'=>$unid));
        if ($result->error) { $response->result = null; }
        else if (count($result->data) > 0)
        {
            $sqlResults = new stdClass();
            $sqlResults->unid = $unid;
            $sqlResults->twitch_username = $result->data[0]->twitch_username;
            $sqlResults->twitch_oauth = $result->data[0]->twitch_oauth; //These keys should probably be encrypted in the database but with my current method the decryption does not return the orignal value, only a boolean.
            $sqlResults->tts_mode = $result->data[0]->tts_mode;
            $sqlResults->tts_voice = $result->data[0]->tts_voice;
            $sqlResults->tts_filter_mode = $result->data[0]->tts_filter_mode;
            $sqlResults->tts_filters = $result->data[0]->tts_filters;
            $sqlResults->aws_region = $result->data[0]->aws_region;
            $sqlResults->aws_identity_pool = $result->data[0]->aws_identity_pool;
            $sqlResults->stt_enabled = $result->data[0]->stt_enabled;
            $response->result = $sqlResults;
        }
        else { $response->result = null; }
    }
    else if (isset($query['update_twitch']))
    {
        $exists = $stream_tools->Select(array('unid'=>$unid));
        if ($exists->error) { $response->result = null; }
        else
        {
            if (count($exists->data) > 0)
            {
                $result = $stream_tools->Update(
                    array(
                        'twitch_username'=>$query['update_twitch']['twitch_username'],
                        'twitch_oauth'=>$query['update_twitch']['twitch_oauth']
                        //'alteredDate'=>'current_timestamp()'
                    ),
                    array(
                        'unid'=>$unid
                    )
                );
    
                if ($result->error || !$result->data) { $response->result = 'Failed to update twitch credentials'; }
                
                $response->result = 'Successfully updated twitch credentials';
            }
            else
            {
                $result = $stream_tools->Insert(array(
                    'unid'=>$unid,
                    'twitch_username'=>$query['update_twitch']['twitch_username'],
                    'twitch_oauth'=>$query['update_twitch']['twitch_oauth']
                    //'alteredDate'=>'current_timestamp()'
                ));
    
                if ($result->error || !$result->data) { $response->result = 'Failed to update twitch credentials'; }
                
                $response->result = 'Successfully updated twitch credentials';
            }
        }
    }
    else if (isset($query['ttsMode']))
    {
        $exists = $stream_tools->Select(array('unid'=>$unid));
        if ($exists->error) { $response->result = null; }
        else
        {
            if (count($exists->data) > 0)
            {
                $result = $stream_tools->Update(
                    array(
                        'tts_mode'=>$query['ttsMode']
                        //'alteredDate'=>'current_timestamp()'
                    ),
                    array(
                        'unid'=>$unid
                    )
                );
    
                if ($result->error || !$result->data) { $response->result = 'Failed to update ttsMode'; }
                else { $response->result = 'Successfully updated ttsMode'; }
            }
            else
            {
                $result = $stream_tools->Insert(array(
                    'unid'=>$unid,
                    'tts_mode'=>$query['ttsMode']
                    //'alteredDate'=>'current_timestamp()'
                ));
    
                if ($result->error || !$result->data) { $response->result = 'Failed to update ttsMode'; }
                else { $response->result = 'Successfully updated ttsMode'; }
            }
        }
    }
    else if (isset($query['update_tts']))
    {
        $exists = $stream_tools->Select(array('unid'=>$unid));
        if ($exists->error) { $response->result = null; }
        else
        {
            if (count($exists->data) > 0)
            {
                $result = $stream_tools->Update(
                    array(
                        'aws_region'=>$query['update_tts']['awsRegion'],
                        'aws_identity_pool'=>$query['update_tts']['awsIdentityPoolID'],
                        'tts_filter_mode'=>$query['update_tts']['filterMode'],
                        'tts_filters'=>$query['update_tts']['filterWords']
                        //'alteredDate'=>'current_timestamp()'
                    ),
                    array(
                        'unid'=>$unid
                    )
                );
    
                if ($result->error || !$result->data) { $response->result = 'Failed to update TTS options'; }
                else { $response->result = 'Successfully updated TTS options'; }
            }
            else
            {
                $result = $stream_tools->Insert(array(
                    'unid'=>$unid,
                    'aws_region'=>$query['update_tts']['awsRegion'],
                    'aws_identity_pool'=>$query['update_tts']['awsIdentityPoolID'],
                    'tts_filter_mode'=>$query['update_tts']['filterMode'],
                    'tts_filters'=>$query['update_tts']['filterWords']
                    //'alteredDate'=>'current_timestamp()'
                ));
    
                if ($result->error || !$result->data) { $response->result = 'Failed to update TTS options'; }
                else { $response->result = 'Successfully updated TTS options'; }
            }
        }
    }
    else if (isset($query['stt_enabled']))
    {
        $exists = $stream_tools->Select(array('unid'=>$unid));
        if ($exists->error) { $response->result = null; }
        else
        {
            if (count($exists->data) > 0)
            {
                $result = $stream_tools->Update(
                    array(
                        'stt_enabled'=>$query['stt_enabled']
                        //'alteredDate'=>'current_timestamp()'
                    ),
                    array(
                        'unid'=>$unid
                    )
                );
    
                if ($result->error || !$result->data) { $response->result = 'Failed to update vcMode'; }
                else { $response->result = 'Successfully updated vcMode'; }
            }
            else
            {
                $result = $stream_tools->Insert(array(
                    'unid'=>$unid,
                    'stt_enabled'=>$query['stt_enabled']
                    //'alteredDate'=>'current_timestamp()'
                ));
    
                if ($result->error || !$result->data) { $response->result = 'Failed to update vcMode'; }
                else { $response->result = 'Successfully updated vcMode'; }
            }
        }
    }
    else { $response->result = 'Invalid Request'; }
}
else { $response->result = 'Account details invalid'; }

echo json_encode($response);