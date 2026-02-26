import { boot } from 'quasar/wrappers';
import store from 'src/store/'; // Points to src/store/index.js

export default boot(({ app }) => {
  app.use(store);
});
