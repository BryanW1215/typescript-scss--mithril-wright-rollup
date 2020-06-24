import {render} from 'mithril'
import {environment} from './environments/environment';

startApp();
function startApp(){
    render(document.body, `Hello there.  The environment is ${environment.environment}`)
}
