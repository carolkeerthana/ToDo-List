const taskInput = document.querySelector(".task-input input"),
notification = document.querySelector(".notification"),
filters = document.querySelectorAll(".filters span"),
clearAll = document.querySelector(".clear-btn"),
okButton = document.querySelector(".btn btn-ok"),
cancelButton = document.querySelector(".btn btn-cancel"),
iconClick = document.querySelector(".icon"),
taskBox = document.querySelector(".task-box");

let editId;
let isEditedTask = false;
//getting localStorage todo-list
let todos = JSON.parse(localStorage.getItem("todo-list"));

filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        showTodo(btn.id);
    })
})

function showNotification(text, id) {
    notification.textContent = text
    notification.classList.add(`${id}`)
    setTimeout(() => {
        notification.textContent = ""
        notification.classList.remove(`${id}`)
    }, 1500)
}

function showTodo(filter){
    let li = "";
    if(todos){
        todos.forEach((todo, id) => {
            //if todo status is completed, set the isCompleted value to checked
            let isCompleted = todo.status == "completed" ? "checked" : "";
            let taskClass = id === 0 ? 'first-task' : (id === todos.length-1 ? 'last-task' : '');
            if(filter == todo.status || filter == "all"){
                li +=`<li class="task ${taskClass}">
                        <label for="${id}">
                            <input onclick="handleCheckboxClick(event)" type="checkbox" id="${id}"${isCompleted}>
                        <p class="${isCompleted}">${todo.name}</p>
                        </label>
                        <div class="settings">
                        <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                        <ul class="task-menu">
                            <li onclick="editTask(${id}, '${todo.name}')"><i class="uil uil-pen"></i>Edit</li>
                            <li onclick="deleteTask(${id})"><i class="uil uil-trash"></i>Delete</li>
                        </ul>
                        </div>
                      </li>`;
                    }
                });
            }
    // if li isn't empty, insert this value inside taskbox else insert span
    taskBox.innerHTML = li || `<span>You don't have any task here</span>`;
}
showTodo("all");

function showMenu(selectedTask){
    //getting task menu div
    let taskMenu = selectedTask.parentElement.lastElementChild;
    taskMenu.classList.add("show");
    document.addEventListener("click", e =>{
        //removing show class from the task menu on the document click
        if(e.target.tagName != "I" || e.target != selectedTask){
            taskMenu.classList.remove("show");
        }
    });
}

function editTask(taskId, taskName){
    editId = taskId;
    isEditedTask = true;
    taskInput.value = taskName;
    taskInput.focus();
}

let taskToDelete; // Store the selected task globally for deletion confirmation

// Function to show the delete confirmation popup
function showDeleteConfirmationPopup() {
    document.getElementById('taskDetails').innerText = `Are you sure you want to delete the task?\n\n ${taskToDelete.name}\n`;
    document.getElementById('deleteConfirmationOverlay').style.display = 'flex';
}

// Function to hide the delete confirmation popup
function hideDeleteConfirmationPopup() {
    document.getElementById('deleteConfirmationOverlay').style.display = 'none';
}

// Function to cancel task deletion
function cancelDeleteTask() {
    hideDeleteConfirmationPopup(); // Hide the delete confirmation popup
}

// Function to initiate task deletion
function deleteTask(deleteId) {
    // Store the task to delete globally
    taskToDelete = {
        id: deleteId,
        name: todos[deleteId].name
    };
    
    // Show the delete confirmation popup
    showDeleteConfirmationPopup();
}

function confirmDeleteTask() {
        // removing selected task from array/todos
        todos.splice(taskToDelete.id, 1);
        localStorage.setItem("todo-list", JSON.stringify(todos));
        showTodo("all");
        hideDeleteConfirmationPopup(); // Hide the delete confirmation popup
        showNotification("Deleted the task", "danger");
}

// Function to show the popup
function showPopup() {
    document.getElementById('confirmationPopup').style.display = 'flex';
}

// Function to hide the popup
function hidePopup() {
    document.getElementById('confirmationPopup').style.display = 'none';
}

// Function to handle the "Ok" button click
function confirmClear(){
    // removing all items of array/todos
    todos.splice(0, todos.length);
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo("all");
    hidePopup();
}

clearAll.addEventListener("click", showPopup);

let selectedCheckbox; // Store the selected checkbox globally

// Function to show the status update popup
function showStatusUpdatePopup() {
    document.getElementById('statusUpdateOverlay').style.display = 'flex';
}

// Function to hide the status update popup
function hideStatusUpdatePopup() {
    document.getElementById('statusUpdateOverlay').style.display = 'none';
}

// Function to handle the checkbox click
function handleCheckboxClick(event) {
    selectedCheckbox = event.target; // Store the selected checkbox
    showStatusUpdatePopup(); // Show the status update popup
}

// Function to cancel the status update
function cancelStatusUpdate() {
    selectedCheckbox.checked = !selectedCheckbox.checked; // Toggle the checkbox state back if canceled
    hideStatusUpdatePopup(); // Hide the status update popup
}

function updateStatus(){
//getting paragraph that contains task name
    let taskName = selectedCheckbox.parentElement.lastElementChild;
    // showStatusUpdatePopup();
        if(selectedCheckbox.checked){
            taskName.classList.add("checked");
            //updating the status of selected task to completed
            todos[selectedCheckbox.id].status = "completed";
        }else{
            taskName.classList.remove("checked"); 
            //updating the status of selected task to pending
            todos[selectedCheckbox.id].status = "pending";
        }
    localStorage.setItem("todo-list", JSON.stringify(todos));
    hideStatusUpdatePopup(); // Hide the status update popup after confirming
    showNotification("Successfully updated the task", "complete");
    if(document.querySelector("span.active").id == "all"){
        showTodo("all");
    }else if(document.querySelector("span.active").id == "completed"){
        showTodo("completed");
    }else {
        showTodo("pending");
    }
}

taskInput.addEventListener("keyup", e =>{
//preventing to enter empty values using  trim() & if cdn(userTask)
    let userTask = taskInput.value.trim();

    if(e.key == "Enter" && userTask){
        addTask();
    }
});

function addTask(){
    let userTask = taskInput.value.trim();
    if(!isTaskAlreadyExists(userTask) && userTask.length>0){
    if(!isEditedTask){ //if isEditedTask isn't true
        if(!todos){ // if todos isn't exist, pass an empty array to todos
            todos = [];
        }
        //by default task status will be pending
        let taskInfo = {name: userTask, status: "pending"};
        todos.unshift(taskInfo); //adding new task to todos
        showNotification("Task is Added Successfully", "success");
    }else{
        isEditedTask = false;
        let editedTask = todos.splice(editId, 1)[0];
        editedTask.name = userTask;
        todos.unshift(editedTask); 
        // todos[editId].name = userTask;
    }
    taskInput.value = "";
    localStorage.setItem("todo-list", JSON.stringify(todos)); //saving to localStorage with todo-list name
    // showTodo("all");
    if(document.querySelector("span.active").id == "all"){
        showTodo("all");
    }else if(document.querySelector("span.active").id == "completed"){
        showTodo("completed");
    }else {
        showTodo("pending");
    }
}else {
    // Show a notification or handle the case when the task already exists
    if(userTask !=""){
    showNotification("Task already exists", "warning");
    taskInput.value = "";
    // taskInput.focus();
    }
}
}

// Function to check if the task already exists
function isTaskAlreadyExists(task) {
    return todos.some(todo => todo.name === task);
}

// Add an event listener to the GIF for the save operation
document.getElementById('gif').addEventListener('click', addTask);