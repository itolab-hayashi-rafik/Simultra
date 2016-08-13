//
//  Vehicle.swift
//  GeoLocationTest
//
//  Created by MasayukiHayashi on 2016/08/13.
//  Copyright © 2016年 MasayukiHayashi. All rights reserved.
//

import Foundation
import SwiftyJSON

class Vehicle {
    struct Location {
        var lat: Double!
        var lon: Double!
    }
    // id
    var id: String?
    // type
    var type: String!
    // location
    var location: Location!
    // velocity
    var velocity: Double!
    // angle
    var angle: Double!
    // wheel
    var wheel: Double!
    
    init(type:String, latitude:Double, longitude:Double) {
        self.id = nil
        self.type = type
        self.location = Location(lat: latitude, lon: longitude)
        self.velocity = 0.0
        self.angle = 0.0
        self.wheel = 0.0
    }
    
    init(json:JSON) {
        update(json)
    }
    
    func update(json: JSON) {
        print("[vehicle] updating: \(json)")
        self.id = json["id"].stringValue
        self.type = json["type"].stringValue
        self.location.lat = json["location"]["lat"].doubleValue
        self.location.lon = json["location"]["lon"].doubleValue
        self.velocity = json["velocity"].doubleValue
        self.wheel = json["wheel"].doubleValue
    }
    
    func toDictionary() -> [String: AnyObject] {
        return [
            "id": (id != nil) ? id! : "",
            "type": type,
            "location": [
                "lat": location.lat,
                "lon": location.lon
            ],
            "velocity": velocity,
            "angle": angle,
            "wheel": wheel
        ]
    }
}