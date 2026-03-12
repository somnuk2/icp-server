<template>
  <q-page class="bg-white q-pa-md">
    <!-- Outer Row to handle centering -->
    <div class="row justify-center">

      <!-- Responsive Column:
           - Before Login: Take full 12 columns
           - After Login: Take 10-11 columns on large screens to match main forms
      -->
      <div
        :class="$store.getters.myAuthenticate ? 'col-12 col-md-11 col-lg-10' : 'col-12'"
        class="q-gutter-y-lg"
      >

        <!-- Main Form-like Container -->
        <q-card flat bordered class="no-shadow" style="border-radius: 8px;">

          <!-- Blue Header Bar (Consistency with main forms) -->
          <q-card-section class="bg-blue-14 text-white text-center q-py-lg">
            <div class="text-h4 text-weight-bold">{{ title }}</div>
          </q-card-section>

          <!-- Image Display Area -->
          <q-card-section class="q-pa-none">
            <div class="flex justify-center">
              <q-img
                v-if="$store.getters.myAuthenticate && $store.getters.myStatus == 'user'"
                src="~assets/images/user.jpg"
                placeholder-src="~assets/images/pics_topic_103.jpg"
                fit="contain"
                class="full-width"
                style="max-height: 80vh;"
              />

              <q-img
                v-else-if="$store.getters.myAuthenticate && $store.getters.myStatus == 'admin'"
                src="~assets/images/admin.jpg"
                placeholder-src="~assets/images/pics_topic_103.jpg"
                fit="contain"
                class="full-width"
                style="max-height: 80vh;"
              />

              <q-img
                v-else-if="$store.getters.myAuthenticate && $store.getters.myStatus == 'suser'"
                src="~assets/images/suser.jpg"
                placeholder-src="~assets/images/pics_topic_103.jpg"
                fit="contain"
                class="full-width"
                style="max-height: 80vh;"
              />

              <q-img
                v-else
                src="~assets/images/pics_topic_103.jpg"
                fit="contain"
                class="full-width"
                style="max-height: 85vh;"
              />
            </div>
          </q-card-section>

          <!-- Login Welcome Footer -->
          <q-card-section v-if="$store.getters.myAuthenticate" class="text-center bg-grey-1 q-py-md">
            <div class="text-subtitle1 text-grey-8">
              ยินดีต้อนรับคุณ <span class="text-weight-bold text-primary">{{ $store.getters.myName }}</span> เข้าสู่ระบบ
            </div>
          </q-card-section>

        </q-card>
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
/* Ensure the page looks clean */
.q-page {
  min-height: auto !important;
}
</style>
