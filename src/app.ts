import { TroubadourServer } from './troubadour-server'
import Configuration from './config/Configuration'

Configuration.initialize(`.`)

// Start the Troubadour server
let server : TroubadourServer = new TroubadourServer()
server.Run()