import { ensureLoggedIn } from 'connect-ensure-login';

const isLoggedIn = ensureLoggedIn('/oauth2/failed');

export default isLoggedIn;
