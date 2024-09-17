const fs = require('fs');
const { Command } = require('commander');
const program = new Command();

const TASKS_FILE = 'tasks.json';

let tasks = [];
try {
  if (fs.existsSync(TASKS_FILE)) {
    const fileContent = fs.readFileSync(TASKS_FILE, 'utf8');
    console.log('File content:', fileContent);  // Log file content
    if (fileContent.trim() === '') {
      console.log('Tasks file is empty. Initializing with an empty array.');
      tasks = [];
    } else {
      try {
        tasks = JSON.parse(fileContent);
        console.log('Loaded tasks:', tasks);  // Log loaded tasks
      } catch (parseError) {
        console.error('Error parsing tasks file. Initializing with an empty array:', parseError.message);
        tasks = [];
      }
    }
  } else {
    console.log('Tasks file does not exist. Will create on first add.');
  }
} catch (error) {
  console.error('Error reading tasks file:', error);
  tasks = [];
}

program
  .name('index')
  .description('CLI to manage tasks')
  .version('0.8.0');

program.command('add')
  .description('Add a task')
  .argument('<string>', 'Task to be added')
  .action((str, options) => {
    const newTask = { [str]: false }; 
    tasks.push(newTask);
    try {
      fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks));
      console.log('Task added successfully');
      console.log('Current tasks:', tasks);
    } catch (error) {
      console.error('Error writing to tasks file:', error);
    }
  });

program.command('show')
  .description('Show tasks')
  .action(() => {
    console.log('Current tasks in memory:', tasks);
    if (tasks.length === 0) {
      console.log('No tasks found.');
    } else {
      console.log('Tasks:');
      tasks.forEach((task, index) => {
        const [taskName, completed] = Object.entries(task)[0];
        console.log(`${index + 1}. ${taskName} - ${completed ? 'Completed' : 'Not Completed'}`);
      });
    }
  });

program.command('delete')
  .description('Delete task by ID')
  .argument('<int>', 'ID of task to be deleted')
  .action((ID, options) => {
    const index = parseInt(ID) - 1;
    if (index >= 0 && index < tasks.length) {
      tasks.splice(index, 1);
      console.log('Task deleted successfully');
      console.log('Current tasks:', tasks);
      fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks));
    } else {
      console.log('Invalid task ID');
    }
  });

program.command('complete')
  .description('Mark completion status of a task')
  .argument('<int>', 'ID of task to toggle')
  .action((ID, options) => {
    const index = parseInt(ID) - 1;
    if (index >= 0 && index < tasks.length) {
      const task = tasks[index];
      const taskName = Object.keys(task)[0];
      task[taskName] = !task[taskName];
      console.log(`Task "${taskName}" toggled to ${task[taskName] ? 'Completed' : 'Not Completed'}`);
      fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks));
    } else {
      console.log('Invalid task ID');
    }
  });

program.parse();
