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
    <script src="<?php echo $WEB_ROOT; ?>/assets/js/main.ts.js" type="module"></script>
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
        </div>
    </section>
</header>
<span class="slideMenu"></span>
<body>
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
                                            <p>Username</p>
                                            <input type="text" id="username" minlength="5" maxlength="24">
                                            <p>oAuth Token</p>
                                            <input type="text" id="oAuthToken" minlength="30" maxlength="36">
                                            <br>
                                            <small class="oAuthTip">
                                                To obtain an oAuth token get one from
                                                <a href="https://twitchapps.com/tmi/" target="_blank">Twitch's oAuth token generator.</a>
                                            </small>
                                            <br>
                                            <button class="hollowButton" id="updateCredentials">Connect</button>
                                            <p id="credentialsAlert"></p>
                                        </td>
                                        <td id="ttsTab" class="displayNone">
                                            <label class="checkboxContainer" id="ttsEnabled">
                                                <span><h5>Enabled</h5></span>
                                                <input type="checkbox" disabled>
                                                <span class="checkmark"></span>
                                            </label>
                                            <div>
                                                <label class="checkboxContainer" id="useAWS">
                                                    <span><h5>Use AWS</h5></span>
                                                    <input type="checkbox" disabled>
                                                    <span class="checkmark"></span>
                                                </label>
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
                            <tbody>
                                <tr>
                                    <td class="time">11:22</td>
                                    <td class="username">kof_readie</td>
                                    <td class="message">hi there, this is a test message!</td>
                                </tr>
                                <tr class="rowSpacer"></tr>
                                <tr>
                                    <td class="time">11:28</td>
                                    <td class="username">Lorem_Ipsum</td>
                                    <td class="message">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</td>
                                </tr>
                                <tr class="rowSpacer"></tr>
                                <tr>
                                    <td class="time">11:25</td>
                                    <td class="username">other_user</td>
                                    <td class="message">Is this real? Or is it a dream.</td>
                                </tr>
                                <tr class="rowSpacer"></tr>
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