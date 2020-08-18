
const scheduleState = {
    BACKLOG: "Backlog",
    DEFINED: "Defined",
    IN_PROGRESS: "In-Progress",
    COMPLETED: "Completed",
    ACCEPTED: "Accepted"
}

const apiKey = "API_KEY";
const additionalParams = "&stylesheet=/slm/doc/webservice/browser&workspace=/slm/webservice/v2.0/workspace/WORKSPACE_ID";

document.addEventListener('DOMContentLoaded', function () {
    var body = document.getElementById("main-list");
    
    getStories().then((data) => {
        let stories = data.QueryResult.Results
        
        const subtitle = document.getElementById("sprint");
        subtitle.appendChild(document.createTextNode(stories[0].Iteration.Name));
        console.log(stories[0].Iteration);
        for (var i = 0; i < stories.length; i++) {

            const storyBox = createStoryItem(stories[i])
            if (stories[i].Defects.Count != 0) {
                let span = document.createElement("span");
                span.classList.add("icon");

                let icon = document.createElement("i");
                icon.classList.add("fas", "fa-bug");

                const right = document.createElement("div");
                right.classList.add("level-item");

                const objectId = stories[i].ObjectID
                getDefects(objectId).then((defects) => {
                    let color = "has-text-danger"
                    if (defects.QueryResult.Results.length == 0) {
                        color = "has-text-link-dark"
                    }
                    icon.classList.add(color);
                    span.appendChild(icon);
                    right.appendChild(span);
                    document.getElementById("right-" + objectId).appendChild(right);
                });

            }

            document.getElementById("loader").style.display = "none";
            body.appendChild(storyBox);
        }
    });
});

async function getStories() {
    let query = "(((Owner.Name = owen_marett@comcast.com) and (Iteration.StartDate <= tomorrow)) and (Iteration.EndDate >= tomorrow))"
    query = encodeURI(query);
    const url = "https://rally1.rallydev.com/slm/webservice/v2.0/hierarchicalrequirement?query=" + query + "&order=Rank&fetch=Name,ScheduleState,Defects,ObjectId,Iteration" + additionalParams;
    const response = await fetch(url, {
        headers: {
            "zsessionid": apiKey
        }
    });

    return response.json();
}

async function getDefects(story) {
    let query = "((Requirement.ObjectId = " + story + ") and (State < Closed))";
    query = encodeURI(query);
    const url = "https://rally1.rallydev.com/slm/webservice/v2.0/defect?query=" + query + "&fetch=State" + additionalParams;

    const response = await fetch(url, {
        headers: {
            "zsessionid": apiKey
        }
    });

    return response.json();
}

function createStoryItem(story) {
    const box = document.createElement("div");
    box.classList.add("box", getStateColor(story.ScheduleState));
    box.style.padding = "20px";

    const left = document.createElement("div");
    left.classList.add("level-left");

    const right = document.createElement("div");
    right.classList.add("level-right");
    right.id = "right-" + story.ObjectID;

    const level = document.createElement("nav");
    level.classList.add("level", "is-mobile");

    const h3 = document.createElement("h3");
    h3.classList.add("level-item", "is-family-primary");
    h3.style.width = "400px"

    const text = document.createTextNode(story.Name);

    box.appendChild(level);
    level.appendChild(left);
    level.appendChild(right);
    left.appendChild(h3);
    h3.appendChild(text);

    return box;
}

function getStateColor(stateString) {
    switch (stateString) {
        case scheduleState.BACKLOG:
            return "has-background-danger";
        //return scheduleState.BACKLOG;
        case scheduleState.DEFINED:
            return "has-background-danger";
        //return scheduleState.DEFINED;
        case scheduleState.IN_PROGRESS:
            return "has-background-warning";
        //return scheduleState.IN_PROGRESS;
        case scheduleState.COMPLETED:
            return "has-background-primary";
        //return scheduleState.COMPLETED;
        case scheduleState.ACCEPTED:
            return "has-background-primary";
        //return scheduleState.ACCEPTED;
    }
}