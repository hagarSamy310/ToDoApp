// DOM ELEMENTS
const newTaskInput = document.getElementById("task-input");
const form = document.getElementById("tasks-form");
const toggleBtn = document.getElementById("toggle-theme");

// STATE MANAGEMENT
let existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
let index = parseInt(JSON.parse(localStorage.getItem("currThemeIndex"))) || 0;
let allTasksPreviouslyCompleted = false;
let isInitializing = true;

// THEME CONFIGURATION
const themes = [
	"./Assets/Images/1.webp",
	"./Assets/Images/2.webp",
	"./Assets/Images/3.webp",
	"./Assets/Images/4.webp",
	"./Assets/Images/5.webp",
	"./Assets/Images/6.webp",
	"./Assets/Images/7.webp",
	"./Assets/Images/8.webp",
	"./Assets/Images/9.webp",
	"./Assets/Images/10.webp",
	"./Assets/Images/11.webp",
];

// APP INITIALIZATION
initializeApp();
isInitializing = false;

function initializeApp() {
	applyTheme(index);
	toggleFreeDayImg();
	if (existingTasks.length !== 0) {
		existingTasks.forEach((task) => {
			renderTasks(task);
		});
	}
}

// THEME FUNCTIONS
function applyTheme(index) {
	document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
        url(${themes[index]}) no-repeat center center /cover`;
}

toggleBtn.addEventListener("click", () => {
	index = (index + 1) % themes.length;
	applyTheme(index);
	localStorage.setItem("currThemeIndex", JSON.stringify(index));
});

// ZERO TASKS IMAGE
function toggleFreeDayImg() {
	const freeDayImg = document.querySelector(".empty-img");
	if (existingTasks.length === 0) {
		freeDayImg.style.display = "block";
		document.getElementById("motivate").textContent = "Free day unlocked !";
	} else {
		freeDayImg.style.display = "none";
	}
}

// TASK CREATION
form.addEventListener("submit", (e) => {
	e.preventDefault();
	addNewTask();
});

function addNewTask() {
	let newTask = newTaskInput.value;
	const taskId = Date.now(); // Unique id for each created task

	if (!emptyTask(newTask)) {
		// Setting task data
		taskData = {
			id: taskId,
			text: newTask,
			completed: false,
		};
		existingTasks.push(taskData);

		// Save to local storage
		localStorage.setItem("tasks", JSON.stringify(existingTasks));
		renderTasks(taskData);
		newTaskInput.value = "";
		newTaskInput.focus();
	} else {
		emptyTaskWarning();
	}
}

// INPUT VALIDATION

// Empty Inputs
function emptyTask(task) {
	return task.trim() === "";
}
// Warning Message
function emptyTaskWarning() {
	const warningContainer = document.createElement("div");
	const warningMsg = document.createElement("p");

	warningMsg.textContent = "Empty input !";
	warningContainer.append(warningMsg);
	warningContainer.classList.add("warning-msg");

	const form = document.getElementById("tasks-form");
	const inputArea = document.getElementById("task-input");

	form.insertBefore(warningContainer, inputArea);

	setTimeout(() => {
		warningContainer.remove();
	}, 1000);
}

// TASK RENDERING
function renderTasks(taskData) {
	const taskItem = document.createElement("li");
	taskItem.dataset.taskId = taskData.id; // Set the id of each li

	// Checkbox
	const checkBox = document.createElement("input");
	checkBox.type = "checkbox";
	checkBox.classList.add("task-check");
	checkBox.checked = taskData.completed || false;
	checkBox.addEventListener("change", (e) => completedTask(e));

	// Text
	const taskText = document.createElement("span");
	taskText.textContent = taskData.text;

	// Style Completed Tasks
	if (taskData.completed) {
		taskText.classList.add("completed");
	}

	// Edit Button
	const editBtn = document.createElement("button");
	editBtn
		.appendChild(document.createElement("i"))
		.classList.add("fa-solid", "fa-pen-to-square");
	editBtn.classList.add("edit-btn");
	editBtn.addEventListener("click", (e) => editTask(e));

	// Delete Button
	const deleteBtn = document.createElement("button");
	deleteBtn
		.appendChild(document.createElement("i"))
		.classList.add("fa-solid", "fa-trash");
	deleteBtn.classList.add("delete-btn");
	deleteBtn.addEventListener("click", (e) => deleteTask(e));

	// Rendering Task Item
	taskItem.append(checkBox, taskText, editBtn, deleteBtn);
	document.getElementById("tasks-list").append(taskItem);

	// Update UI
	trackProgress();
	toggleFreeDayImg();
}

// TASK EDITING
function editTask(e) {
	const li = e.target.closest("li");
	const span = li.querySelector("span");
	const editInput = document.createElement("input");

	editInput.classList.add("edit-area");
	editInput.type = "text";
	editInput.value = span.textContent;

	li.replaceChild(editInput, span);
	editInput.focus();

	editInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			if (!emptyTask(editInput.value)) {
				updateTask(li, editInput);
			} else {
				emptyTaskWarning();
			}
		}
	});
	editInput.addEventListener("blur", () => {
		if (!emptyTask(editInput.value)) {
			updateTask(li, editInput);
		} else {
			emptyTaskWarning();
		}
	});
}

function updateTask(li, input) {
	const span = document.createElement("span");
	span.textContent = input.value;

	if (li.querySelector(".task-check").checked) {
		span.classList.add("completed");
	}
	li.replaceChild(span, input);

	// Update in memory
	const taskId = parseInt(li.dataset.taskId);
	const index = existingTasks.findIndex((task) => task.id === taskId);
	if (index !== -1) {
		existingTasks[index].text = span.textContent;
	}
	localStorage.setItem("tasks", JSON.stringify(existingTasks));
}

// TASK COMPLETION
function completedTask(e) {
	const liEl = e.target.closest("li");

	if (e.target.checked) {
		liEl.querySelector("span").classList.add("completed");
	} else {
		liEl.querySelector("span").classList.remove("completed");
	}
	trackProgress();

	const taskId = parseInt(liEl.dataset.taskId);
	const index = existingTasks.findIndex((task) => task.id === taskId);

	if (index !== -1) {
		existingTasks[index].completed = e.target.checked;
	}
	localStorage.setItem("tasks", JSON.stringify(existingTasks));
}

// TASK DELETION
function deleteTask(e) {
	const li = e.target.closest("li");
	const taskId = parseInt(li.dataset.taskId);
	// Delete From Local Storage
	existingTasks = existingTasks.filter((task) => task.id !== taskId);
	localStorage.setItem("tasks", JSON.stringify(existingTasks));
	// Delete From UI
	li.remove();
	trackProgress();
	toggleFreeDayImg();
}

// PROGRESS TRACKING
function trackProgress() {
	const progressBar = document.getElementById("progress");
	const progressNumbers = document.getElementById("numbers");
	const totalTasks = document.querySelectorAll("ul li").length;
	const completedTasks = document.querySelectorAll(
		".task-check:checked"
	).length;

	progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;
	progressBar.style.width = totalTasks
		? `${(completedTasks / totalTasks) * 100}%`
		: "0%";

	// Celebrate Progress
	const motivationWords = document.getElementById("motivate");

	const allTasksCurrentlyCompleted =
		totalTasks > 0 && totalTasks === completedTasks;

	// Prevent Celebration On Reload or Re-celebrating Previously Completed Tasks
	if (
		!isInitializing &&
		allTasksCurrentlyCompleted &&
		!allTasksPreviouslyCompleted
	) {
		celebrate();
		motivationWords.textContent = "You did it ! 🎉";
	}
	if (allTasksCurrentlyCompleted) {
		motivationWords.textContent = "You did it ! 🎉";
	} else if (completedTasks > 0 && totalTasks > completedTasks) {
		motivationWords.textContent = "Keep going ✨";
	} else if (totalTasks > 0 && completedTasks === 0) {
		motivationWords.textContent = "Make it happen 👏";
	} else {
		motivationWords.textContent = "Free day unlocked !";
	}
	allTasksPreviouslyCompleted = allTasksCurrentlyCompleted;
}

// CELEBRATION ANIMATION
function celebrate() {
	const duration =  1 * 1000,
		animationEnd = Date.now() + duration,
		defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

	function randomInRange(min, max) {
		return Math.random() * (max - min) + min;
	}

	const interval = setInterval(function () {
		const timeLeft = animationEnd - Date.now();

		if (timeLeft <= 0) {
			return clearInterval(interval);
		}

		const particleCount = 50 * (timeLeft / duration);

		confetti(
			Object.assign({}, defaults, {
				particleCount,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
			})
		);
		confetti(
			Object.assign({}, defaults, {
				particleCount,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
			})
		);
	}, 100);
}
