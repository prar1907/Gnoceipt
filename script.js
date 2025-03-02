$(document).ready(function () {
    console.log("jQuery is loaded and script.js is connected!");
    $(".dot").eq(2).css("background-color", "#E9C8AE");
    $("#centeringContainer").hide();
    let currentActiveIcon = $("#uploadButton");
    $(".slidyslide").hide();
    $("#weeklyMeterCircle").hide();
    $("#mainScreen").show();

    let average = 5;
    let ratingList = [5];
    let points = 25;

    const screenMap = {
        chatButton: "#chatScreen",
        historyButton: "#historyScreen",
        uploadButton: "#mainScreen",
        progressButton: "#progressScreen",
        weeklyButton: "#weeklyScreen"
    };
    const pointsMap = {
        0: "images/pot.png",
        25: "images/plant1.png",
        50: "images/plant2.png",
        75: "images/plant3.png",
    };

    // Nav bar interactions
    $(".navIcon").click(function () {
        if ((currentActiveIcon !== this) && (currentActiveIcon[0] !== this)) {
            $(currentActiveIcon).animate({ top: "0px" }, 300);
            $("#centeringContainer").hide();
        }
        $(this).animate({ top: "-58px" }, 300);
        if (this.id !== "uploadButton") {
            $(this).css("cursor", "default");
        }
        let iconLeft = $(this).position().left;
        $("#navSelection").animate({ left: iconLeft + 53 }, 300);
        let iconIndex = $(this).index();
        $(".dot").css("background-color", "transparent");
        $(".dot").eq(iconIndex).css("background-color", "#E9C8AE");
        currentActiveIcon = this;
        $(".slidyslide").hide();
        $(screenMap[this.id]).show();

        if ($(currentActiveIcon).attr("id") === "uploadButton") {
            $("#centeringContainer").toggle();
            $("#dropArea").html('<p>Drag file here or browse.</p>');
        }
        if (points >= 75) {
            if ($(currentActiveIcon).attr("id") === "progressButton") {
                // Hide everything except the congrats screen
                $(".slidyslide, #navBar, #centeringContainer, #weeklyMeterCircle, #settingsButton, #dotdotdot, #returntoMain, #congratsText").hide();
                $("#congrats").show();
                
                // Animate plant zoom-in effect
                $("#plantImage").css({ transform: "scale(1)" }) // Reset scale
                    .animate({ transform: "scale(2)" }, { 
                        step: function (now) { $(this).css("transform", `scale(${now})`); }, 
                        duration: 3000 
                    });
        
                // Show congratulatory message with fade effect
                $("#fadeText").fadeOut(1500);
                $("#congratsText").fadeIn(1500);
                setTimeout(function () {
                    $("#returntoMain").fadeIn();
                }, 3000);
            }
        }
    });
    $("#returntoMain").click(function () {
        points = 0;
        $("#progressNum").text(points)
        $("#plantImage").attr("src", pointsMap[0]);
        $("#plantImage").css("height", "100px")
        $("#congrats").hide();
        $(".slidyslide, #navBar,#settingsButton, #dotdotdot").show();
        $("#mainScreen").show();
    });
    // Flyout File Upload
    $("#dropArea").mouseover(function () {
        $(this).css("background-color", "#E9E9E9");
    }).mouseleave(function () {
        $(this).css("background-color", "");
    }).click(function () {
        $("#fileInput").click();
    });

    $("#dropArea").on("drop", function (e) {
        e.preventDefault();
        $(this).removeClass("dragover");
        let files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });

    $("#fileInput").on("change", function (e) {
        let files = e.target.files;
        handleFiles(files);
    });

    // Handle file uploads (only accept one file)
    function handleFiles(files) {
        if (files.length > 0) {
            let file = files[0];
            let reader = new FileReader();       
            reader.onload = function (e) {
                $("#dropArea").html("");
                let imgPreview = $("<img>").attr("src", e.target.result)
                    .css({ "max-width": "100%", "max-height": "100%", "object-fit": "contain" });
                let uploadingText = $("<div>").attr("id", "uploadingText").text("Uploading...");
                $("#dropArea").append(imgPreview, uploadingText);
                setTimeout(function () {
                    $("#uploadingText").text("File Uploaded Successfully!");
                    let ratingScore = calculateRatingScore();
                    addReceiptToHistory(e.target.result, ratingScore);
                    updateRatingList(ratingScore);
                }, 1000);
            };
            reader.readAsDataURL(file);
            $("#fileInput").val('');
        }
    }

    function calculateRatingScore() {
        return Math.floor(Math.random() * 10) + 1;
    }

    // Function to add receipt to history screen with dynamic rating meter
    function addReceiptToHistory(imageSrc, ratingScore) {
        let date = new Date().toLocaleDateString();  
        let ratingCard = $("<div>").addClass("ratingCard").append(
            $("<p>").addClass("ratingDate").text(date),
            $("<div>").addClass("ratingBox").append(
                $("<img>").addClass("receipt").attr("src", imageSrc),
                $("<div>").addClass("whiteOverlay"),
                $("<p1>").addClass("pointsLabel").text("Points"),
                $("<h1>").addClass("pointsNum").text(ratingScore),
                $("<p>").html("Sustainability Score<span class='susScore'></span>"),
                $("<div>").addClass("ratingMeterContainer").append(
                    $("<div>").addClass("ratingMeterCircle").addClass("ratingCircle_" + Date.now()),
                    $("<img>").addClass("ratingMeter").attr("src", "images/ratingMeter.png")
                )
            )
        );  
        points = points + 25;
        $("#progressNum").text(points)
        handlePlant();
        $(".ratingCardContainer").prepend(ratingCard);
        positionRatingCircle(ratingScore);
    }

    function handlePlant() {
        if (points >= 75) {
            $("#plantImage").attr("src", pointsMap[75]);
            alert("Congratulations, you've reached 75 points!");
        } else if (points >= 50) {
            $("#plantImage").attr("src", pointsMap[50]);
        } else if (points >= 25) {
            $("#plantImage").attr("src", pointsMap[25]);
        } else {
            $("#plantImage").attr("src", pointsMap[0]);
        }
    } 

    // Function to position the rating circle based on score
    function positionRatingCircle(ratingScore) {
        let positionPercentage = ratingScore * 10;
        let ratingCircle = $(".ratingCircle_" + Date.now());
        ratingCircle.css("left", positionPercentage + "%");
    }

    // Update the rating list with the new score and calculate the average
    function updateRatingList(newScore) {
        ratingList.push(newScore);
        let sum = ratingList.reduce((a, b) => a + b, 0);
        average = Math.round(sum / ratingList.length);
        $("#weeklyNumber").text(average);
    }

    // Close flyout menu when clicking outside
    $(document).click(function (event) {
        if (!$(event.target).closest("#centeringContainer, #uploadButton").length) {
            $("#centeringContainer").hide();
            $("#dropArea").html('<p>Drag file here or browse.</p>');
        }
    });

    // Sending messages to chatbot
    $("#sendButton").click(function () {
        sendMessage();
    });

    $("#inputMessage").keypress(function (event) {
        if (event.which === 13 && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
    
    // Making new chats
    /*function sendMessage() {
        let userInput = $("#inputMessage").val().trim();
        if (userInput !== "") {
            $("#messageContainerContainer").append(
                $("<div>").addClass("userMessageContainer")
                    .append(
                        $("<img>").addClass("pfp").attr("src", "images/userpfp.png"),
                        $("<div>").addClass("box").append($("<p>").text(userInput))
                    )
            ).scrollTop($("#messageContainerContainer")[0].scrollHeight);
            $("#inputMessage").val('');
        }
    }*/
        function sendMessage() {
            let userInput = $("#inputMessage").val().trim();
            if (userInput !== "") {
                // Append user's message to chat container
                $("#messageContainerContainer").append(
                    $("<div>").addClass("userMessageContainer")
                        .append(
                            $("<img>").addClass("pfp").attr("src", "images/userpfp.png"),
                            $("<div>").addClass("box").append($("<p>").text(userInput))
                        )
                ).scrollTop($("#messageContainerContainer")[0].scrollHeight);
                $("#inputMessage").val('');
        
                // Make an AJAX POST request to your Flask chatbot endpoint
                $.ajax({
                    url: "http://127.0.0.1:5002/ask-chatbot", // if your Flask server is on the same origin
                    // If not, use the full URL (e.g., "http://127.0.0.1:5002/ask-chatbot")
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        user_id: "default_user", // Replace with a dynamic user ID if needed
                        query: userInput
                    }),
                    success: function(response) {
                        // Append chatbot's reply to chat container
                        $("#messageContainerContainer").append(
                            $("<div>").addClass("chatbotMessageContainer")
                                .append(
                                    $("<img>").addClass("pfp").attr("src", "images/chatbotpfp.png"),
                                    $("<div>").addClass("box").append($("<p>").text(response.response))
                                )
                        ).scrollTop($("#messageContainerContainer")[0].scrollHeight);
                    },
                    error: function(xhr, status, error) {
                        console.error("Error calling chatbot API: ", error);
                        // Optionally, display an error message in your chat container
                    }
                });
            }
        }
        
});
