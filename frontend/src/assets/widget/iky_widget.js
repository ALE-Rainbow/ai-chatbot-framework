(function () {
    var config = {
        "base_url": window.iky_base_url,
        "chat_context": window.chat_context
    }

    // Localize jQuery variable
    var jQuery;

    /******** Load jQuery if not present *********/
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.4.2') {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src",
            "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function () { // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler();
                }
            };
        } else {
            script_tag.onload = scriptLoadHandler;
        }
        // Try to find the head, otherwise default to the documentElement
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery;
        main(config);
    }

    /******** Called once jQuery has loaded ******/
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        // Call our main function
        main(config);
    }

    /******** Our main function ********/
    function main(config) {
        jQuery(document).ready(function ($) {
            console.log("received", config)
            /******* Load CSS *******/
            var css_link = $("<link>", {
                rel: "stylesheet",
                type: "text/css",
                href: config["base_url"] +"assets/widget/style.css"
            });
            css_link.appendTo('head');


            content = `
            <div class="iky_chatbox">
            <div class="iky_container">
                <div class="iky_close">  
                    <div class="btn_close"></div>
                </div>
                <div class="iky_chat_holder">
                    <ul class="iky_Chat_container">
                    </ul>
                    <div class="chat-indications">
                        <div class="typing-indicator"><span></span><span></span><span></span></div>
                    </div>
            
                </div>
                <div class="iky_input">
                        <input type="text" class="iky_user_input_field" placeholder="type your query here">
                </div>
            </div>
            <div class="iky_btn_action">
                <button class="iky_action"> Chat Now <div class="iky_smile"></div></button>
            </div>
            </div>
            `
            document.body.innerHTML += content;

            /******* chat begins *******/

            if (typeof payload == "undefined") {
                payload =
                    {
                        "currentNode": "",
                        "complete": true,
                        "parameters": [],
                        "extractedParameters": {},
                        "missingParameters": [],
                        "intent": {},
                        "context": config["chat_context"],
                        "input": "init_conversation",
                        "speechResponse": []
                    }


            }

            var send_req =  (userQuery)=> {
                // send request to bot
                payload["input"] = userQuery;
                $.ajax({
                    url: config["base_url"]+'gateway/api/v1',
                    // url: 'http://localhost:8080/api/v1',
                    type: 'POST',
                    data: JSON.stringify(payload),
                    contentType: 'application/json; charset=utf-8',
                    datatype: "json",
                    success: successRoutes,
                    error: errorRoutes,
                });
                return true;
            };


            successRoutes = function (response) {
                var responseObject;
                if (typeof response == 'object') {
                    responseObject = response;
                }
                else {
                    var parsedResponse = JSON.parse(response);
                    responseObject = parsedResponse.responseData;
                }
                put_text(responseObject);
            };

            errorRoutes = function (x, t, m) {
                responseObject = {};
                if (t === "timeout") {
                    responseObject["speechResponse"] = "Due to band-width constraints, I'm not able to serve you now, please try again later"
                } else {
                    responseObject["speechResponse"] = "I'm not able to serve you at the moment, please try again later"
                }
                put_text(responseObject);
            };

            function scrollToBottom() {
                $(".iky_Chat_container").stop().animate({ scrollTop: $(".iky_Chat_container")[0].scrollHeight}, 1000);
            }

            var put_text = function (bot_say) {
                payload = bot_say;
                $.each(bot_say["speechResponse"],function (index, data) {
                    html_data = '<li class="message_row iky_text">'+ data +'</li>';
                    $("ul.iky_Chat_container").append(html_data);
                  });

                scrollToBottom();
            };



            send_req("init_conversation");


            $('.iky_user_input_field').keydown(function (e) {
                if (e.keyCode == 13) {
                    userQuery = $(".iky_user_input_field").val();
                    $(".iky_user_input_field").val("");
                    html_data = ' <li class="message_row iky_user_text">'+userQuery+'</li>';
                    $("ul.iky_Chat_container").append(html_data);
                    send_req(userQuery);

                }
            })
            $(".iky_action, .btn_close").click(function(){
                $(".iky_container").toggle();
            });

        });
        

    }

})(); // We call our anonymous function immediately