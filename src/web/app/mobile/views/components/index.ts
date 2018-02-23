import Vue from 'vue';

import ui from './ui.vue';
import timeline from './timeline.vue';
import posts from './posts.vue';
import imagesImage from './images-image.vue';
import drive from './drive.vue';
import postPreview from './post-preview.vue';
import subPostContent from './sub-post-content.vue';
import postCard from './post-card.vue';
import userCard from './user-card.vue';
import postDetail from './post-detail.vue';
import followButton from './follow-button.vue';
import friendsMaker from './friends-maker.vue';
import notification from './notification.vue';
import notifications from './notifications.vue';
import notificationPreview from './notification-preview.vue';
import usersList from './users-list.vue';
import userPreview from './user-preview.vue';
import userTimeline from './user-timeline.vue';
import activity from './activity.vue';
import widgetContainer from './widget-container.vue';

//#region widgets
import wActivity from './widgets/activity.vue';
//#endregion

Vue.component('mk-ui', ui);
Vue.component('mk-timeline', timeline);
Vue.component('mk-posts', posts);
Vue.component('mk-images-image', imagesImage);
Vue.component('mk-drive', drive);
Vue.component('mk-post-preview', postPreview);
Vue.component('mk-sub-post-content', subPostContent);
Vue.component('mk-post-card', postCard);
Vue.component('mk-user-card', userCard);
Vue.component('mk-post-detail', postDetail);
Vue.component('mk-follow-button', followButton);
Vue.component('mk-friends-maker', friendsMaker);
Vue.component('mk-notification', notification);
Vue.component('mk-notifications', notifications);
Vue.component('mk-notification-preview', notificationPreview);
Vue.component('mk-users-list', usersList);
Vue.component('mk-user-preview', userPreview);
Vue.component('mk-user-timeline', userTimeline);
Vue.component('mk-activity', activity);
Vue.component('mk-widget-container', widgetContainer);

//#region widgets
Vue.component('mkw-activity', wActivity);
//#endregion
