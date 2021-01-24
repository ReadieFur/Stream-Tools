<?php
    //https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API

    $WEB_ROOT;
    $SITE_ROOT;
    $DOCUMENT_ROOT = $_SERVER["DOCUMENT_ROOT"];
    require_once "$DOCUMENT_ROOT/roots.php";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark light">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Stream Chat"/>
    <meta property="og:description" content="A stream chat service that..."/>
    <meta property="og:url" content="https://readie.global-gaming.co/stream-chat"/>
    <meta property="og:image" content="https://cdn.global-gaming.co/images/team/members/readiecircle.png"/>
    <title>Stream Chat | Chat</title>
    <link rel="icon" href="https://cdn.global-gaming.co/images/team/members/readiecircle.png" type="image/png">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700%7cOpen+Sans:400,700" rel="stylesheet" type="text/css">
    <link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>/assets/css/main.css"/>
    <link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>/assets/css/chat.css"/>
    <link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>/assets/css/settings.css"/>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://sdk.amazonaws.com/js/aws-sdk-2.831.0.min.js"></script>
    <script src="<?php echo $WEB_ROOT; ?>/assets/js/bundle.js" type="module"></script>
    <script>var WEB_ROOT = "<?php echo $WEB_ROOT; ?>";</script>
    <style id="themeColours"></style>
</head>
<header id="header">
    <link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>/assets/css/header.css"/>
    <section>
        <span class="bottomStripThin"></span>
        <div class="titleContainer">
            <a href="<?php echo $WEB_ROOT; ?>/">
                <img class="imgSmall titleIcon" src="https://cdn.global-gaming.co/images/team/members/readiecircle.png" alt="Where is the logo?">
                <h3 class="title">Stream Chat</h3>
            </a>
        </div>
        <div class="navigationContainer">
            <a id="settingsButton">Settings</a>
            <a id="accountButton">Account</a>
        </div>
    </section>
</header>
<span class="slideMenu"></span>
<body>
    <iframe id="account"></iframe>
    <div id="settingsContainer">
        <div id="settingsBackground"></div>
        <div id="settingsMenu" class="center">
            <table>
                <tbody>
                    <tr class="settingsTitleRow">
                        <th><h3>Settings</h3></th>
                    </tr>
                    <tr>
                        <td class="settingsRadioTabs">
                            <label class="radioButtonContainer">
                                <span><h5>Credentials</h5></span>
                                <input type="radio" name="radio" id="credentialsRadio" checked="checked">
                                <span class="radioButton"></span>
                            </label>
                            <label class="radioButtonContainer">
                                <span><h5>Text To Speech</h5></span>
                                <input type="radio" name="radio" id="ttsRadio">
                                <span class="radioButton"></span>
                            </label>
                            <!--<label class="radioButtonContainer">
                                <span><h5>Voice commands</h5></span>
                                <input type="radio" name="radio" id="vcRadio">
                                <span class="radioButton"></span>
                            </label>-->
                            <label class="radioButtonContainer">
                                <span><h5>Other</h5></span>
                                <input type="radio" name="radio" id="otherRadio">
                                <span class="radioButton"></span>
                            </label>
                        </td>
                        <td class="settingsTabs">
                            <table>
                                <tbody>
                                    <tr>
                                        <td id="credentialsTab" class="displayNone">
                                            <form id="twitchCredentialsForm">
                                                <p>Username</p>
                                                <input type="text" id="username" minlength="5" maxlength="24" autocomplete="username">
                                                <p>oAuth Token</p>
                                                <input type="password" id="oAuthToken" minlength="30" maxlength="36" autocomplete="current-password">
                                            </form>
                                            <small>
                                                To obtain an oAuth token get one from Twitch's
                                                <a class="link" href="https://twitchapps.com/tmi/" target="_blank">
                                                    oAuth token generator.
                                                </a>
                                            </small>
                                            <br>
                                            <button class="hollowButton" id="updateCredentials">Save</button>
                                            <p id="credentialsAlert"></p>
                                        </td>
                                        <td id="ttsTab" class="displayNone">
                                            <label class="checkboxContainer" id="ttsEnabled">
                                                <span><h5>Enabled</h5></span>
                                                <input type="checkbox" disabled>
                                                <span class="checkmark"></span>
                                            </label>
                                            <div id="ttsSettings">
                                                <!--<div id="optionsContainer">
                                                    <label class="checkboxContainer" id="useAWS">
                                                        <span><h5>Use AWS</h5></span>
                                                        <input type="checkbox" disabled>
                                                        <span class="checkmark"></span>
                                                    </label>
                                                </div>-->
                                                <div id="ttsOptionsContainer">
                                                    <form id="awsCredentialsForm">
                                                        <p>Region</p>
                                                        <input type="text" id="awsRegion" autocomplete="username">
                                                        <p>Identity Pool ID</p>
                                                        <input type="password" id="awsIdentityPoolID" autocomplete="current-password">
                                                        <br>
                                                        <small>
                                                            To obtain these details please read the
                                                            <a class="link" href="https://github.com/kOFReadie/AWS-Polly-for-SpeechChat/blob/master/AWS%20Setup.md" target="_blank">guide</a>
                                                            I have written on my GitHub.
                                                        </small>
                                                    </form>
                                                    <button class="hollowButton" id="updateAWSCredentials">Save</button>
                                                </div>
                                            </div>
                                        </td>
                                        <!--<td id="vcTab" class="displayNone"></td>-->
                                        <td id="otherTab" class="displayNone">
                                            <label class="checkboxContainer" id="darkMode">
                                                <span><h5>Dark Mode</h5></span>
                                                <input type="checkbox" disabled>
                                                <span class="checkmark"></span>
                                            </label>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <table id="mainTable">
        <tbody>
            <tr id="chatRow">
                <td>
                    <div>
                        <table id="chatTable">
                            <tbody></tbody>
                        </table>
                    </div>
                </td>
            </tr>
            <tr id="messageRow">
                <td>
                    <textarea id="messageInput" placeholder="Send a message"></textarea>
                    <div>
                        <div>
                            <audio id="ttsPlayer"></audio>
                            <p id="volumePercent">50%</p>
                            <input id="volumeSlider" type="range" min="1" max="100" value="50">
                            <button id="sendMessageButton">Send</button>
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>