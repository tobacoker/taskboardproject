$(document).ready(function () {
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
    let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

    function generateTaskId() {
        let id = nextId++;
        localStorage.setItem("nextId", JSON.stringify(nextId));
        return id;
    }

    function createTaskCard(task) {
        let taskId = task.id;
        let taskTitle = task.title;
        let dueDate = task.dueDate ? "Due Date: " + task.dueDate : "";

        // Creating the task card elements
        let taskCard = $("<div>").addClass("card draggable-task").attr("id", "task-" + taskId);
        let cardBody = $("<div>").addClass("card-body").html("<strong>" + taskTitle + "</strong><br>" + dueDate);

        // Adding a delete button to the task card
        let deleteButton = $("<button>")
            .addClass("btn btn-sm btn-danger delete-task")
            .html('<i class="fas fa-trash-alt"></i>');

        // Appending the card body and delete button to the task card
        taskCard.append(cardBody, deleteButton);

        // Making the task card draggable
        taskCard.draggable({
            revert: "invalid",
            stack: ".card",
            containment: "document",
            cursor: "move"
        });

        return taskCard;

    }

    function renderTaskList() {
        $("#todo-cards").empty();
        $("#in-progress-cards").empty();
        $("#done-cards").empty();

        // Sorting tasks by due date
        taskList.sort(function (a, b) {
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else {
                return 0;
            }
        });

        taskList.forEach(function (task) {
            let taskCard = createTaskCard(task);
            $("#" + task.status + "-cards").append(taskCard);
            if (task.status === "to-do") {
                $("#todo-cards").append(taskCard);
            } else if (task.status === "in-progress") {
                $("#in-progress-cards").append(taskCard);
            } else if (task.status === "done") {
                $("#done-cards").append(taskCard);
            }
        });
    }

    function handleAddTask(event) {
        event.preventDefault();
        let taskTitle = $("#taskTitle").val();
        let dueDate = $("#dueDate").val(); // Retrieve the due date value
        let newTask = {
            id: generateTaskId(),
            title: taskTitle,
            dueDate: dueDate, // Store the due date in the task object
            status: "to-do"
        };
        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));
    
        // Log the newly created task to the console
        console.log("Adding New Task:", newTask);
    
        // Append the new task card to the appropriate column
        let taskCard = createTaskCard(newTask);
        $("#" + newTask.status + "-cards").append(taskCard);
    
        // Make the new task card draggable
        taskCard.draggable({
            revert: "invalid",
            stack: ".card",
            containment: "document",
            cursor: "move"
        });
    
        // Hide the form modal after adding the task
        $("#formModal").modal("hide");
    
        // Render the updated task list
        renderTaskList();
    }
    


    function handleDrop(event, ui) {
        let taskId = ui.draggable.attr("id").split("-")[1];
        let newStatus = $(this).attr("id");
        taskList.forEach(function (task) {
            if (task.id == taskId) {
                task.status = newStatus;
            }
        });
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    }

    function handleDeleteTask(event) {
        event.preventDefault();

        // Extract the task ID from the clicked element
        let taskId = $(this).closest('.card').attr('id').split('-')[1];

        // Filter out the task with the corresponding ID from the taskList array
        taskList = taskList.filter(function (task) {
            return task.id != taskId;
        });

        // Update the localStorage with the updated taskList
        localStorage.setItem('tasks', JSON.stringify(taskList));

        // Remove the task card from the DOM
        $(this).closest('.card').remove();
    }

    renderTaskList();

    // Make columns droppable
    $("#to-do, #in-progress, #done").droppable({
        drop: handleDrop,
        accept: ".card"
    });

    // Bind form submission to handleAddTask function
    $("#addTaskForm").submit(handleAddTask);

    // Bind click event for delete tasks
    $(document).on("click", ".delete-task", handleDeleteTask);
});