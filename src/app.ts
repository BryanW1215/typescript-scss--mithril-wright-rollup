import {render} from 'mithril'
import {environment} from './environments/environment';

startApp();
function startApp(){
    render(document.body, `The environment is ${environment.environment}`)
}
