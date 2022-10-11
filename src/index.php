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
    <meta property="og:url" content="https://readiefur.com/stream-chat"/>
    <meta property="og:image" content="https://cdn.readiefur.com/images/team/members/readiecircle.png"/>
    <title>Stream Tools</title>
    <link rel="icon" href="https://cdn.readiefur.com/images/team/members/readiecircle.png" type="image/png">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700%7cOpen+Sans:400,700" rel="stylesheet" type="text/css">
    <link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>/assets/css/main.css"/>
    <link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>/assets/css/chat.css"/>
    <link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>/assets/css/settings.css"/>
    <script src="https://cdn.readiefur.com/resources/scripts/jquery/jquery-3.5.1.min.js"></script>
    <script src="https://cdn.readiefur.com/resources/scripts/aws/aws-sdk-2.840.0.min.js"></script>
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
                <img class="imgSmall titleIcon" src="https://cdn.readiefur.com/images/team/members/readiecircle.png" alt="Where is the logo?">
                <h3 class="title">Stream Tools</h3>
            </a>
        </div>
        <div class="navigationContainer">
            <a id="settingsButton">Settings</a>
            <a id="accountButton">Account</a>
        </div>
    </section>
    <iframe id="accountContainer" src="//api.readiefur.<?php echo $DOMAIN[count($DOMAIN) - 1]; ?>/account/"></iframe>
    <div id="alertBoxContainer">
        <div class="background"></div>
        <div id="alertBox">
            <input id="alertBoxTextBox" type="text">
            <p id="alerBoxText"></p>
            <p class="dismissText"><small>Click to dismiss this messaege.</small></p>
        </div>
    </div>
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
                            <label class="radioButtonContainer">
                                <span><h5>Voice commands</h5></span>
                                <input type="radio" name="radio" id="vcRadio">
                                <span class="radioButton"></span>
                            </label>
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
                                            <!--Maybe add an error text area to each of the tabs-->
                                        </td>
                                        <td id="ttsTab" class="displayNone">
                                            <label class="checkboxContainer" id="ttsEnabled">
                                                <span><h5>Enabled</h5></span>
                                                <input type="checkbox" disabled>
                                                <span class="checkmark"></span>
                                            </label>
                                            <div id="ttsSettings" class="invertedScroll">
                                                <!--Add options for WebSpeechAPI TTS-->
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
                                                            <a class="link" href="https://github.com/kOFReadie/Stream-Tools/blob/master/AWS%20Setup.md" target="_blank">guide</a>
                                                            I have written on my GitHub.
                                                        </small>
                                                        <label class="checkboxContainer" id="filtersEnabled">
                                                            <span><p>Filters</p></span>
                                                            <input type="checkbox" disabled>
                                                            <span class="checkmark"></span>
                                                        </label>
                                                        <div id="filterOptions">
                                                            <label class="radioButtonContainer">
                                                                <span><p>Remove from message</p></span>
                                                                <input type="radio" name="radio" id="filterRemoveMessage" checked>
                                                                <span class="radioButton"></span>
                                                            </label>
                                                            <label class="radioButtonContainer">
                                                                <span><p>Skip message</p></span>
                                                                <input type="radio" name="radio" id="filterSkipMessage">
                                                                <span class="radioButton"></span>
                                                            </label>
                                                            <!--Add a replace word option-->
                                                            <!--Add spam filters-->
                                                            <textarea id="filterWords"></textarea>
                                                            <br>
                                                            <small id="filterWordsInfo">Put a comma ',' between each word to be filtered.</small>
                                                        </div>
                                                    </form>
                                                    <button class="hollowButton" id="updateAWSCredentials">Save</button>
                                                    <p id="awsAlert"></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td id="vcTab" class="displayNone">
                                            <small id="vcSupportNotice">
                                                This feature is not supported by your browser.<br>
                                                Check the list of supported browsers <a class="link" href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/SpeechRecognition#browser_compatibility" target="_blank">here</a>.
                                            </small>
                                            <div id="vcContainer">
                                                <label class="checkboxContainer" id="vcEnabled">
                                                    <span><h5>Enabled</h5></span>
                                                    <input type="checkbox" disabled>
                                                    <span class="checkmark"></span>
                                                </label>
                                                <div id="vcOptionsContainer">
                                                    <p>Input Device</p>
                                                    <select id="inputDevices"></select>
                                                    <!--<p>Input Preview</p>
                                                    <audio controls id="inputPreview"></audio>-->
                                                    <p>Input Relay</p>
                                                    <input type="text" id="inputRelay" disabled>
                                                    <!--Add a commands list with togglable options-->
                                                    <!--Add a relay message -> to the main ui under the chat?-->
                                                    <br>
                                                    <button class="hollowButton" id="saveVCSettings">Save</button>
                                                </div>
                                            </div>
                                        </td>
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
                            <tbody>
                                <!--<tr>
                                    <td class="time">22:14</td>
                                    <td class="username">kof_readie</td>
                                    <td class="message">
                                        <span>a message</span>
                                    </td>
                                </tr>-->
                                <!--<tr>
                                    <td class="time">22:14</td>
                                    <td class="username">kof_readie</td>
                                    <td class="message">
                                        <span>a message with an emote </span>
                                        <img src="https://static-cdn.jtvnw.net/emoticons/v1/28/1.0">
                                        <span> in the middle</span>
                                    </td>
                                </tr>-->
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
            <tr id="messageRow">
                <td>
                    <textarea id="messageInput" placeholder="Send a message"></textarea>
                    <div>
                        <div>
                            <audio id="ttsPlayer"></audio> <!--Create a custom player with a skip button and progress bars-->
                            <p id="volumePercent">50%</p>
                            <input id="volumeSlider" type="range" min="0" max="100" value="50">
                            <button id="sendMessageButton">Send</button>
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>