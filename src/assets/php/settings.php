<?php
//!!!Add mysqli_real_escape_string() to all values!!!

include_once $_SERVER['DOCUMENT_ROOT'].'/../api/account/DBDetails.php';
include_once $_SERVER['DOCUMENT_ROOT'].'/../api/account/accountFunctions.php';

$query = json_decode($_POST['q'], true);
$response = new stdClass();
$unid = $query['unid'];

if (LogIn($query['unid'], $query['pass'])) //This function does exist, intelisense just cant find it at the path specified above
{
    if (isset($query['get_all']))
    {
        $sql = "SELECT settings.twitch_username, settings.twitch_oauth, settings.tts_mode, settings.tts_voice, settings.tts_filter_mode, settings.tts_filters, settings.aws_region, settings.aws_identity_pool, settings.stt_enabled
        FROM users usr
        LEFT JOIN stream_tools settings
        ON settings.unid = usr.unid
        WHERE settings.unid = '$unid'";

        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0)
        {
            $sqlResults = new stdClass();
            $row = mysqli_fetch_assoc($result);
            $sqlResults->unid = $unid;
            $sqlResults->twitch_username = $row['twitch_username'];
            $sqlResults->twitch_oauth = $row['twitch_oauth']; //These keys should probably be encrypted in the database but with my current method the decryption does not return the orignal value, only a boolean.
            $sqlResults->tts_mode = $row['tts_mode'];
            $sqlResults->tts_voice = $row['tts_voice'];
            $sqlResults->tts_filter_mode = $row['tts_filter_mode'];
            $sqlResults->tts_filters = $row['tts_filters'];
            $sqlResults->aws_region = $row['aws_region'];
            $sqlResults->aws_identity_pool = $row['aws_identity_pool'];
            $sqlResults->stt_enabled = $row['stt_enabled'];
            $response->result = $sqlResults;
        }
        else { $response->result = null; }
    }
    else if (isset($query['update_twitch']))
    {
        $twitch_username = $query['update_twitch']['twitch_username'];
        $twitch_oauth = $query['update_twitch']['twitch_oauth'];

        $sql = "INSERT INTO stream_tools(
            unid,
            twitch_username,
            twitch_oauth,
            alteredDate
        )
        VALUES(
            '$unid',
            '$twitch_username',
            '$twitch_oauth',
            current_timestamp()
        )
        ON DUPLICATE KEY UPDATE
        twitch_username = '$twitch_username',
        twitch_oauth = '$twitch_oauth',
        alteredDate = current_timestamp()";

        $result = mysqli_query($conn, $sql);

        if ($result === TRUE) { $response->result = 'Successfully updated twitch credentials'; }
        else { $response->result = 'Failed to update twitch credentials'; }
    }
    else if (isset($query['ttsMode']))
    {
        $ttsMode = $query['ttsMode'];

        $sql = "INSERT INTO stream_tools(
            unid,
            tts_mode,
            alteredDate
        )
        VALUES(
            '$unid',
            $ttsMode,
            current_timestamp()
        )
        ON DUPLICATE KEY UPDATE
        tts_mode = $ttsMode,
        alteredDate = current_timestamp()";

        $result = mysqli_query($conn, $sql);

        if ($result === TRUE) { $response->result = 'Successfully updated ttsMode'; }
        else { $response->result = 'Failed to update ttsMode'; }
    }
    else if (isset($query['update_tts']))
    {
        $aws_region = $query['update_tts']['awsRegion'];
        $aws_identity_pool = $query['update_tts']['awsIdentityPoolID'];
        $tts_filter_mode = $query['update_tts']['filterMode'];
        $tts_filters = $query['update_tts']['filterWords'];

        $sql = "INSERT INTO stream_tools(
            unid,
            aws_region,
            aws_identity_pool,
            tts_filter_mode,
            tts_filters,
            alteredDate
        )
        VALUES(
            '$unid',
            '$aws_region',
            '$aws_identity_pool',
            '$tts_filter_mode',
            '$tts_filters',
            current_timestamp()
        )
        ON DUPLICATE KEY UPDATE
        aws_region = '$aws_region',
        aws_identity_pool = '$aws_identity_pool',
        tts_filter_mode = '$tts_filter_mode',
        tts_filters = '$tts_filters',
        alteredDate = current_timestamp()";

        $result = mysqli_query($conn, $sql);

        if ($result === TRUE) { $response->result = 'Successfully updated TTS options'; }
        else { $response->result = 'Failed to update TTS options'; }
    }
    else if (isset($query['stt_enabled']))
    {
        $stt_enabled = $query['stt_enabled'];

        $sql = "INSERT INTO stream_tools(
            unid,
            stt_enabled,
            alteredDate
        )
        VALUES(
            '$unid',
            $stt_enabled,
            current_timestamp()
        )
        ON DUPLICATE KEY UPDATE
        stt_enabled = $stt_enabled,
        alteredDate = current_timestamp()";

        $result = mysqli_query($conn, $sql);

        if ($result === TRUE) { $response->result = 'Successfully updated vcMode'; }
        else { $response->result = 'Failed to update vcMode'; }
    }
    else { $response->result = 'Invalid Request'; }
}
else { $response->result = 'Account details invalid'; }

echo json_encode($response);