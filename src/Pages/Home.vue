<template>
  <div>
    <h1 class="text-center text-4xl">TodoList</h1>
    <hr class="my-5" />
    <div class="grid md:grid-cols-3 gap-4 mt-5 px-10">
      <div class="completed-task">
        <p class="text-center text-lg font-bold text-gray-600">
          Completed tasks
        </p>

        <!-- <vs-card v-for="todo in completedTodos" :key="todo.id"></vs-card> -->
      </div>
      <div class="add-task">
        <p class="text-center text-lg font-bold text-gray-600">Add Tasks</p>
        <input
          v-model="newTodo"
          @keyup.enter="addTodo"
          autofocus
          autocomplete="off"
          placeholder="What needs to be done?"
          class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 my-5"
        />
        <!-- <button
          @click="addTask"
          class="bg-blue-500 w-full mb-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save task
        </button> -->
        <div class="flex justify-start mb-4 ml-3">
          <vs-checkbox
            v-show="todos.length"
            v-model="allDone"
            class=""
          ></vs-checkbox>
        </div>
        <ul class="mt-2">
          <li>
            <vs-card v-for="todo in todos" :key="todo.id">
              <div class="flex justify-between py-auto">
                <div class="">
                  <vs-checkbox
                    @click="updateTodo(todo)"
                    v-model="todo.completed"
                  ></vs-checkbox>
                </div>
                <div>
                  <p
                    @click="editTodo(todo)"
                    class="text-sm"
                    v-show="editIndex != todo.id"
                    role="button"
                  >
                    {{ todo.title }}
                  </p>
                  <div class="" v-show="editIndex == todo.id">
                    <input
                      v-model="todo.title"
                      @keyup.enter="doneEdit(todo)"
                      @keyup.esc="cancelEdit(todo)"
                      class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 my-5"
                    />
                  </div>
                </div>
                <div>
                  <span
                    role="button"
                    @click="removeTodo(todo)"
                    class="material-icons"
                  >
                    close
                  </span>
                </div>
              </div>
            </vs-card>
          </li>
        </ul>
      </div>
      <div class="uncompleted-task">
        <p class="text-center text-lg font-bold text-gray-600">
          Uncompleted tasks
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: [],
      newTask: null,
      newTodo: null,
      updatedTask: null,
      editIndex: null,
      database: null,
      todos: [],
      editedTodo: null,
      remaining: 0,
    };
  },
  mounted() {
    if (localStorage.getItem("tasks")) {
      try {
        this.tasks = JSON.parse(localStorage.getItem("tasks"));
      } catch (e) {
        localStorage.removeItem("tasks");
      }
    }

    this.getDatabase();
  },

  async created() {
    this.todos = await this.getTodoStore();
  },
  methods: {
    addTodo() {
      const value = this.newTodo && this.newTodo.trim();
      const todoItem = {
        id: this.todos.length + 1,
        title: value,
        completed: false,
      };

      if (!value) {
        return;
      }

      this.todos.push(todoItem);
      this.saveTodo(todoItem);
      this.newTodo = "";
    },

    cancelEdit(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },

    async deleteTodo(todo) {
      this.database = await this.getDatabase();

      return new Promise((resolve, reject) => {
        const transaction = this.database.transaction("todos", "readwrite");
        const store = transaction.objectStore("todos");

        store.delete(todo.id);

        transaction.oncomplete = () => {
          resolve("Item successfully deleted.");
        };

        transaction.onerror = (event) => {
          reject(event);
        };
      });
    },

    doneEdit(todo) {
      if (!this.editedTodo) {
        return;
      }

      todo.title = todo.title.trim();
      this.saveTodo({
        ...todo,
        title: todo.title,
      });
      if (!todo.title) {
        this.removeTodo(todo);
      }

      this.editIndex = null;
    },

    editTodo(todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
      this.editIndex = todo.id;
    },

    async getDatabase() {
      return new Promise((resolve, reject) => {
        if (this.database) {
          resolve(this.database);
        }
        let request = window.indexedDB.open("todoDB", 1);

        request.onerror = (event) => {
          console.log("ERROR: Unable to open database", event);
          reject("Error");
        };

        request.onsuccess = (event) => {
          this.database = event.target.result;
          resolve(this.database);
        };

        request.onupgradeneeded = (event) => {
          let database = event.target.result;
          database.createObjectStore("todos", {
            autoIncrement: true,
            keyPath: "id",
          });
        };
      });
    },

    async getTodoStore() {
      this.database = await this.getDatabase();

      return new Promise((resolve, reject) => {
        const transaction = this.database.transaction("todos", "readonly");
        const store = transaction.objectStore("todos");

        let todoList = [];

        store.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            todoList.push(cursor.value);
            cursor.continue();
          }
        };

        transaction.oncomplete = () => {
          resolve(todoList);
        };

        transaction.onerror = (event) => {
          reject(event);
        };
      });
    },

    removeTodo(todo) {
      const index = this.todos.indexOf(todo);
      this.todos.splice(index, 1);
      this.deleteTodo(todo);
    },

    async saveTodo(todo) {
      this.database = await this.getDatabase();

      return new Promise((resolve, reject) => {
        const transaction = this.database.transaction("todos", "readwrite");

        const store = transaction.objectStore("todos");

        store.put(todo);

        transaction.oncomplete = () => {
          resolve("Item successfully saved.");
        };

        transaction.onerror = (event) => {
          reject(event);
        };
      });
    },

    updateTodo(todo) {
      this.todos.find((item) => item === todo).completed = !todo.completed;
      this.saveTodo({
        ...todo,
      });
    },

    addTask() {
      if (!this.newTask) {
        return;
      }

      this.tasks.push(this.newTask);
      this.newTask = "";
      this.saveTask();
    },

    editTask(task) {
      if (!this.updatedTask) return;
      this.tasks.splice(task, 1, this.updatedTask);
      this.saveTask();
      this.edit = false;
    },

    saveTask() {
      const parsedTask = JSON.stringify(this.tasks);
      localStorage.setItem("tasks", parsedTask);
    },

    removeTask(task) {
      this.tasks.splice(task, 1);
      this.saveTask();
    },
  },
  computed: {
    allDone: {
      get() {
        return this.remaining === 0;
      },
      set(value) {
        this.todos.forEach((todo) => {
          todo.completed = value;
          this.saveTodo({
            ...todo,
          });
        });
      },
    },

    completedTodos() {
      return todos.filter((item) => item == true);
    },
  },
  // watch: {
  //     task(newTask) {
  //         localStorage.task = newTask
  //         this.tasks.push(localStorage.task)
  //     }
  // }
};
</script>

<style></style>
