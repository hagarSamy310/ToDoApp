document.addEventListener("DOMContentLoaded", () => {
	const newTaskInput = document.getElementById("task-input");
	const form = document.getElementById("tasks-form");

	let existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
	let allTasksPreviouslyCompleted = false;
	let isInitializing = true;
	initializeApp();
	isInitializing = false;

	function initializeApp() {
		toggleFreeDayImg();
		if (existingTasks.length !== 0) {
			existingTasks.forEach((task) => {
				renderTasks(task);
			});
		}
	}

	// Display this image if there's no tasks
	function toggleFreeDayImg() {
		const freeDayImg = document.querySelector(".empty-img");
		if (existingTasks.length === 0) {
			freeDayImg.style.display = "block";
			document.getElementById("motivate").textContent = "Free day unlocked !";
		} else {
			freeDayImg.style.display = "none";
		}
	}
	// Adding a new task
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

	// Check for empty inputs
	function emptyTask(task) {
		return task.trim() === "";
	}

	// Displays a warning message
	function emptyTaskWarning() {
		const warningContainer = document.createElement("div");
		const warningMsg = document.createElement("p");

		warningMsg.textContent = "Empty input...please enter a task!";

		warningContainer.append(warningMsg);
		warningContainer.classList.add("warning-msg");
		document.body.append(warningContainer);

		setTimeout(() => {
			warningContainer.style.display = "none";
		}, 2000);
	}

	function renderTasks(taskData) {
		const taskItem = document.createElement("li");
		// Set the id of each li
		taskItem.dataset.taskId = taskData.id;

		const checkBox = document.createElement("input");
		checkBox.type = "checkbox";
		checkBox.classList.add("task-check");
		// Set checkboxes completed state for each task
		checkBox.checked = taskData.completed || false;
		// Update completed state
		checkBox.addEventListener("change", (e) => completedTask(e));

		const taskText = document.createElement("span");
		taskText.textContent = taskData.text;

		// Style completed task
		if (taskData.completed) {
			taskText.classList.add("completed");
		}

		const editBtn = document.createElement("button");
		editBtn
			.appendChild(document.createElement("i"))
			.classList.add("fa-solid", "fa-pen-to-square");
		editBtn.classList.add("edit-btn");

		// Edit Task
		editBtn.addEventListener("click", (e) => editTask(e));

		const deleteBtn = document.createElement("button");
		deleteBtn
			.appendChild(document.createElement("i"))
			.classList.add("fa-solid", "fa-trash");
		deleteBtn.classList.add("delete-btn");

		deleteBtn.addEventListener("click", (e) => deleteTask(e));

		taskItem.append(checkBox, taskText, editBtn, deleteBtn);
		document.getElementById("tasks-list").append(taskItem);

		trackProgress();
		toggleFreeDayImg();
	}

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
		li.replaceChild(span, input);

		// Update in memory
		const taskId = parseInt(li.dataset.taskId);
		const index = existingTasks.findIndex((task) => task.id === taskId);
		if (index !== -1) {
			existingTasks[index].text = span.textContent;
		}
		localStorage.setItem("tasks", JSON.stringify(existingTasks));
	}

	function completedTask(e) {
		const liEl = e.target.closest("li");
		// Style completed task
		if (e.target.checked) {
			liEl.querySelector("span").classList.add("completed");
		} else {
			liEl.querySelector("span").classList.remove("completed");
		}
		trackProgress();
		const taskId = parseInt(liEl.dataset.taskId);
		// Update completed state in local storage
		const index = existingTasks.findIndex((task) => task.id === taskId);
		if (index !== -1) {
			existingTasks[index].completed = e.target.checked;
		}
		localStorage.setItem("tasks", JSON.stringify(existingTasks));
	}

	function deleteTask(e) {
		const li = e.target.closest("li");
		const taskId = parseInt(li.dataset.taskId);
		// Delete from local storage
		existingTasks = existingTasks.filter((task) => task.id !== taskId);
		localStorage.setItem("tasks", JSON.stringify(existingTasks));
		// Delete from the UI
		li.remove();
		trackProgress();
		toggleFreeDayImg();
	}
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

		// Celebrate progress
		const motivationWords = document.getElementById("motivate");

		const allTasksCurrentlyCompleted =
			totalTasks > 0 && totalTasks === completedTasks;
		// Prevent celebrate on reload or re-celebrate previously completed ones
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

	function celebrate() {
		const duration = 2 * 1000,
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
});
