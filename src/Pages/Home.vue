<template>
  <div>
    <h1 class="text-center text-4xl">TodoList</h1>
    <hr class="my-5" />
    <div class="grid md:grid-cols-3 gap-4 mt-5 px-10">
      <div class="completed-task">
        <p class="text-center text-lg font-bold text-gray-600">
          Completed tasks
        </p>
      </div>
      <div class="add-task">
        <p class="text-center text-lg font-bold text-gray-600">Add Tasks</p>
        <input
          class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 my-5"
        />
        <div class="flex justify-start mb-4 ml-3">
          <vs-checkbox class="" v-model="isCompleted"></vs-checkbox>
        </div>
        <ul class="mt-2">
          <li>
            <vs-card v-for="n in 5" :key="n" class="p-1">
              <div class="flex justify-between">
                <div class="">
                  <vs-checkbox v-model="isCompleted"></vs-checkbox>
                </div>
                <div>
                  <p class="text-sm">Watch Netflix</p>
                </div>
                <div>
                  <span role="button" class="material-icons"> close </span>
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
      task: "",
      tasks: [],
      isCompleted: false,
    };
  },
  mounted() {
    if (localStorage.tasks) {
      // this.task = localStorage.task
      this.tasks.push(localStorage.task);
    }
  },
  methods: {
    addTask() {
      localStorage.tasks = this.task;
      //   this.tasks.push(localStorage.task);
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
