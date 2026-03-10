<template>
  <q-page class="bg-white flex flex-center">
    <!-- Main Content Container with max-width for balance -->
    <div class="full-width column items-center q-pa-md" style="max-width: 1000px;">

      <!-- Blue Title Bar -->
      <q-card flat class="bg-blue-14 text-white full-width q-mb-lg" style="border-radius: 8px;">
        <q-card-section class="text-center q-py-sm">
          <h1 class="text-h5 text-weight-bold q-ma-none">
            {{ title }}
          </h1>
        </q-card-section>
      </q-card>

      <!-- Main Image Display Area -->
      <div class="full-width row justify-center">
        <div class="col-12 flex justify-center">
          <q-img
            v-if="$store.getters.myAuthenticate && $store.getters.myStatus == 'user'"
            src="~assets/images/user.jpg"
            placeholder-src="~assets/images/pics_topic_103.jpg"
            fit="contain"
            class="full-width shadow-2 rounded-borders"
            style="max-height: 75vh;"
          ></q-img>

          <q-img
            v-else-if="$store.getters.myAuthenticate && $store.getters.myStatus == 'admin'"
            src="~assets/images/admin.jpg"
            placeholder-src="~assets/images/pics_topic_103.jpg"
            fit="contain"
            class="full-width shadow-2 rounded-borders"
            style="max-height: 75vh;"
          ></q-img>

          <q-img
            v-else-if="$store.getters.myAuthenticate && $store.getters.myStatus == 'suser'"
            src="~assets/images/suser.jpg"
            placeholder-src="~assets/images/pics_topic_103.jpg"
            fit="contain"
            class="full-width shadow-2 rounded-borders"
            style="max-height: 75vh;"
          ></q-img>

          <q-img
            v-else
            src="~assets/images/pics_topic_103.jpg"
            fit="contain"
            class="full-width shadow-2 rounded-borders"
            style="max-height: 75vh;"
          ></q-img>
        </div>
      </div>

      <!-- Optional Welcome Tag (Enabled when logged in) -->
      <div v-if="$store.getters.myAuthenticate" class="q-mt-md text-grey-8">
        ยินดีต้อนรับคุณ <span class="text-weight-bold text-primary">{{ $store.getters.myName }}</span>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "IndexPage",
  data() {
    return {
      title: "Individualized Career Planning",
    };
  },
};
</script>

<style scoped>
/* Added shadow and rounded corners for a premium look */
.rounded-borders {
  border-radius: 12px;
}
</style>
