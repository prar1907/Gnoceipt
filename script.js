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
    let points = 50;

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

        if ($(currentActiveIcon).attr("id") === "chatButton") {
            $(".background").attr("src", "images/wheat.png");
        } else if ($(currentActiveIcon).attr("id") === "historyButton") {
            $(".background").attr("src", "images/bee.png");
        } else {
            $(".background").attr("src", "images/clouds.png");
        }

        if ($(currentActiveIcon).attr("id") === "progressButton") {
            $("#selectionDivot").attr("src", "images/navBar/selectionDivotBrown.png");
        } else if ($(currentActiveIcon).attr("id") === "chatButton"){
            $("#selectionDivot").attr("src", "images/navBar/selectionDivotYellow.png"); 
        } else {
            $("#selectionDivot").attr("src", "images/navBar/selectionDivot.png"); 
        }
        if (points >= 75) {
            if ($(currentActiveIcon).attr("id") === "progressButton") {
                $(".slidyslide, #navBar, #centeringContainer, #weeklyMeterCircle, #settingsButton, #dotdotdot, #returntoMain, #congratsText").hide();
                $("#congrats").fadeIn(1000);
                $("#congratsText").fadeIn(1500);
                setTimeout(function () {
                    $("#returntoMain").fadeIn();
                }, 3000);
            }
        }
    });
    $("#returntoMain").click(function () {
        points = 0;
        currentActiveIcon = $("#uploadButton");
        $("#progressButton").attr("src", "images/navBar/progressButton.png");
        $("#progressNum").text(points);
        $("#plantImage").attr("src", pointsMap[0]);
        $("#congrats, #congratsText, #returntoMain, #fadeText").hide();
        $(".slidyslide, #navBar, #settingsButton, #dotdotdot, #clouds").show();
        $(".slidyslide").hide();
        $("#mainScreen").show();
        $(".navIcon").animate({ top: "0px" }, 300);
        $("#uploadButton").animate({ top: "-58px" }, 300);
        $("#navSelection").animate({ left: $("#uploadButton").position().left + 53 }, 300);
        $("#selectionDivot").attr("src", "images/navBar/selectionDivot.png"); 
        $(".dot").css("background-color", "transparent");
        $(".dot").eq(2).css("background-color", "#E9C8AE");
        $("#centeringContainer").hide();
    
        // Flower
        let flowerId = `flower${Date.now()}`;
        $("#mainScreen").append(`<div class="flowerContainer" id="${flowerId}"><img src="images/flower.png" class="flower"></div>`);
        let randomBottom = Math.random() * (53 - 45) + 45;  // Random between 45% and 53%
        let randomLeft = Math.random() * (50 - 35) + 35;    // Random between 35% and 50%
        $(`#${flowerId}`).css({
            "bottom": `${randomBottom}%`,
            "left": `${randomLeft}%`,
            "transform": "translateY(100%)"
        });
        setTimeout(() => {
            $(`#${flowerId} .flower`).css("transition", "transform 1.5s ease-in-out");
            $(`#${flowerId} .flower`).css("transform", "translateY(0%)");
        }, 100);   
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
    async function handleFiles(files) {
        let file=files[0]
        if (!files[0]) {
            console.error("No file selected");
            return;
        }
        console.log(file)
        
        if (files.length > 0) {
            let file = files[0];
            let reader = new FileReader();       
            reader.onload = function (e) {
                $("#dropArea").html("");
                let imgPreview = $("<img>").attr("src", e.target.result)
                    .css({ "max-width": "100%", "max-height": "100%", "object-fit": "contain" });
                let uploadingText = $("<div>").attr("id", "uploadingText").text("Uploading...");
                $("#dropArea").append(imgPreview, uploadingText);
                setTimeout(async function () {
                    $("#uploadingText").text("File Uploaded Successfully!");
                    let formData = new FormData();
                    formData.append("file", file);
                    try {
                        await fetch("http://localhost:5001/add", {
                            method: "POST",
                            body: formData,
                            mode:"no-cors"
                        });
                        let ratingScore = await calculateRatingScore();
                        console.log("the rating score is",ratingScore)
                        addReceiptToHistory(e.target.result, ratingScore);
                        updateRatingList(ratingScore);
            //let result = await response.json();
            //console.log(result); // Display extracted items
                        } catch (error) {
                            console.error("Error uploading file:", error);
                        }
                }, 5000);
            };
            reader.readAsDataURL(file);
            $("#fileInput").val('');
    }
    }
    let userscore=0
    async function calculateRatingScore() {
        try {
            const response = await fetch("http://localhost:5001/getScore");
            if (!response.ok) {
                throw new Error("Error fetching score");
            }
            const data = await response.json();
            console.log("Calculated score is:", data.score);
            userscore=userscore+data.score
            return data.score;
        } catch (error) {
            console.error("Error in calculateRatingScore:", error);
            return 0; // Return 0 or some default value in case of an error
        }
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
        points = points + userscore;
        console.log("points for update is",points)
        $("#progressNum").text(points)
        handlePlant();
        $(".ratingCardContainer").prepend(ratingCard);
        positionRatingCircle(ratingScore);
    }

    function handlePlant() {
        if (points >= 75) {
            $("#plantImage").attr("src", pointsMap[75]);
            $("#progressButton").attr("src", "images/navBar/progressButtonColored.png");
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
                                $("<img>").addClass("pfp").attr("src", "images/gnomepfp.png"),
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