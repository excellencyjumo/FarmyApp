import farmRoutes from './farms/farmRoutes.js';
import farmProductRoutes from './farms/farmProductRoutes.js'
import userRoutes from './customers/userRoutes.js';
import storeRoutes from './stores/storeRoutes.js';
import logisticsRoutes from './logistics/logisticsRoutes.js'

const routes = (app) => {
    const BaseUrl = '/api/v1'
    //using routes
    app.use(`${BaseUrl}/farm`, farmRoutes)
    app.use(`${BaseUrl}/farmproduct`, farmProductRoutes)
    app.use(`${BaseUrl}/user`, userRoutes)
    app.use(`${BaseUrl}/store`, storeRoutes)
    app.use(`${BaseUrl}/logistics`, logisticsRoutes)
}

export default routes;