//
//  WebAPI.swift
//  GeoLocationTest
//
//  Created by MasayukiHayashi on 2016/08/13.
//  Copyright © 2016年 MasayukiHayashi. All rights reserved.
//

import Alamofire
import Starscream
import SwiftyJSON

struct WebApi {
    static let baseUrl = "http://chino.itolab.nitech.ac.jp:3000/api/v1"
    static let wsBaseUrl = "ws://chino.itolab.nitech.ac.jp:3000/api/v1"
    
    struct Vehicles {
        static func getAll(callback: [Vehicle] -> Void) {
            let url = WebApi.baseUrl + "/vehicles"
            Alamofire.request(.GET, url)
                .responseJSON(completionHandler: {response in
                    switch response.result {
                    case .Success(let value):
                        let array = JSON(value)
                        callback(array.map({ (_,json) in Vehicle(json: json) }))
                        break
                    case .Failure(let error):
                        print(error)
                        break
                    }
                })
        }
        
        static func createNew(vehicle: Vehicle, callback: (Vehicle) -> Void) {
            let url = WebApi.baseUrl + "/vehicles/new"
            let data = try! NSJSONSerialization.dataWithJSONObject(vehicle.toDictionary(), options: [])
            
            let request = NSMutableURLRequest(URL: NSURL(string: url)!)
            request.HTTPMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.HTTPBody = data
            Alamofire.request(request)
                .responseJSON(completionHandler: {response in
                    switch response.result {
                    case .Success(let value):
                        let json = JSON(value)
                        vehicle.update(json)
                        callback(vehicle)
                        break
                    case .Failure(let error):
                        print(error)
                        break
                    }
                })
        }
        
        static func update(vehicle: Vehicle, callback: (Vehicle) -> Void) {
            let url = WebApi.baseUrl + "/vehicles/" + vehicle.id!
            let data = try! NSJSONSerialization.dataWithJSONObject(vehicle.toDictionary(), options: [])

            let request = NSMutableURLRequest(URL: NSURL(string: url)!)
            request.HTTPMethod = "PUT"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.HTTPBody = data
            Alamofire.request(request)
                .responseJSON(completionHandler: {response in
                    switch response.result {
                    case .Success(let value):
                        let json = JSON(value)
                        vehicle.update(json)
                        callback(vehicle)
                        break
                    case .Failure(let error):
                        print(error)
                        break
                    }
                })
        }
        
        static func delete(vehicle: Vehicle, callback: (Vehicle) -> Void) {
            let url = WebApi.baseUrl + "/vehicles/" + vehicle.id!
            Alamofire.request(.DELETE, url)
                .responseJSON(completionHandler: {response in
                    switch response.result {
                    case .Success(let value):
                        let json = JSON(value)
                        vehicle.update(json)
                        callback(vehicle)
                        break
                    case .Failure(let error):
                        print(error)
                        break
                    }
                })
        }
        
        static func ws(vehicle: Vehicle) -> WSController {
            let id = "iphone"
            let url = WebApi.baseUrl + "/vehicles/" + vehicle.id! + "/ws?id=" + id
            return WSController(socket: WebSocket(url: NSURL(string: url)!))
        }
        struct WSController {
            let socket: WebSocket!
            var callback: ((JSON) -> Void)?
            
            init(socket: WebSocket) {
                self.socket = socket
                self.callback = nil
                
                socket.onConnect = {
                    print("[websocket] connected")
                }
                socket.onDisconnect = { (error: NSError?) in
                    print("[websocket] disconnected: \(error?.localizedDescription)")
                }
                socket.onText = { (value: String) in
                    print("[websocket] received: \(value)")
                    if (self.callback != nil) {
                        let json = JSON(value)
                        self.callback!(json)
                    }
                }
                socket.connect()
            }
            
            func update(vehicle: Vehicle) {
                let data = try! NSJSONSerialization.dataWithJSONObject(vehicle.toDictionary(), options: [])
                let json = NSString(data: data, encoding: NSUTF8StringEncoding)!
                print("[websocket] sending: \(json)")
                self.socket.writeString(json as String)
            }
            
            mutating func setCallback(callback: (JSON) -> Void) {
                self.callback = callback
            }
            
            func close() {
                self.socket.disconnect()
            }
        }
    }
}