/* pt-controller.js
 * -----------
 * A set of event listeners in a function that serve as the controller
 */

// attaches all relevant listeners
attachListeners = function() {
    // click listener for the paper to record prospective pitches
    $("#paper").click(function(event) {
        var location = ptModel.getPitchLocation(event);
        ptModel.setProspectivePitch(location);
        ptViewFunctions.drawProspectivePitch(location);
    });

    // submit button to submit pitches
    $("#submitPitch").click(function() {
        ptViewFunctions.noError();
        var pitch = {
            type: $("#pitchTypeInput").val(),
            velocity: $("#pitchVelocityInput").val(),
            result: $("#pitchResultInput").val()
        };

        // if all data is properly entered
        if (isValidPitch(pitch, ptModel.getProspectivePitch())) {
            ptModel.submitPitch(pitch);
            ptViewFunctions.submitPitch(pitch);
            clearPitchInputs();
            if (pitch.result == "p") {
                setInputView("resultInput");
                ptViewFunctions.setMessage("In play, select a result");
            } else if (ptModel.getCount().substring(0, 1) == 4) {
                setPaResult("bb");
            } else if (ptModel.getCount().substring(2, 3) == 3) {
                setPaResult("k");
            } else {
                ptViewFunctions.noError();
                $("#pitchTypeInput").focus();
            }
        } else {
            ptViewFunctions.setError("There is missing data");
        }
    });

    // submit button to submit pitcher and hitter
    $("#submitPlayers").click(function() {
        var pitcherName = $("#pitcherNameInput").val();
        var hitterName = $("#hitterNameInput").val();
        if (pitcherName && hitterName) {
            ptModel.setPlayers(pitcherName, hitterName);
            $("#captionNames").text("Pitcher: " + pitcherName + ", Hitter: " + hitterName);
            setInputView("pitchInput");
            clearPlayerInputs
            ptViewFunctions.noError();
        } else {
            ptViewFunctions.setError("Missing pitcher and/or hitter data")
        }
    });

    $("#submitResult").click(function() {
        var paResult = $("#paResultSelector").val();
        if (paResult != "na") {
            ptViewFunctions.setMessage("The plate appearance ended in a " + paResult);
            setPaResult(paResult);
        } else {
            ptViewFunctions.setError("You need to select a plate appearance result");
        }
    });
}

// helper function to determine whether pitch is a valid pitch
// and that a location was previously entered
isValidPitch = function(pitch, prospectivePitch) {
    return pitch.type != "na" && pitch.velocity > 0 && pitch.result != "na" && prospectivePitch;
}

// determines whether a plate appearance is over, returning the result of the pa
// or null if the pa is not over
isPaOver = function(pitch) {
    var count = ptModel.getCount();
    // relies on string format "b-s"
    return pitch.result == "p" || count.substring(0, 1) == 4 || count.substring(2, 3) == 3;
}

// clears the inputs related to pitch information
clearPitchInputs = function() {
    $("#pitchTypeInput").val("na");
    $("#pitchVelocityInput").val("");
    $("#pitchResultInput").val("na");
}

// clears the inputs related to player information
clearPlayerInputs = function() {
    $("#pitcherNameInput").val("");
    $("#hitterNameInput").val("");
}

// clears the input related to pa result information
clearResultInput = function() {
    $("#paResultSelector").val("");
}

// sets the single input view that is specified by id to visisble
setInputView = function(id) {
    id = "#" + id;
    inputs.forEach(function(input) {
        $(input).toggle(input == id);
    });
}

setPaResult = function(result) {
    ptModel.setPaResult(result);
    ptViewFunctions.endPa(result);
    setInputView("playerInput");
}
