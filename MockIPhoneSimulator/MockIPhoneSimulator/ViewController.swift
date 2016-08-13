//
//  ViewController.swift
//  MockIPhoneSimulator
//
//  Created by MasayukiHayashi on 2016/08/13.
//  Copyright © 2016年 itolab. All rights reserved.
//

import UIKit
import CoreLocation

class ViewController: UIViewController, CLLocationManagerDelegate {
    
    var lm: CLLocationManager!
    var vehicle: Vehicle!
    var api: WebApi.Vehicles.WSController?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // init
        self.lm = CLLocationManager()
        self.vehicle = Vehicle(type: "veyron", latitude: 0.0, longitude: 0.0)
        self.api = nil
        
        // location manager
        self.lm.delegate = self
        self.lm.requestAlwaysAuthorization()
        
        // create a vehicle
        WebApi.Vehicles.createNew(vehicle, callback: {vehicle in
            self.vehicle = vehicle
            self.startIfReady()
        })
    }
    
    override func viewWillAppear(animated: Bool) {
        super.viewWillAppear(animated)
        self.startIfReady()
    }
    
    override func viewWillDisappear(animated: Bool) {
        super.viewWillDisappear(animated)
        self.stop()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func startIfReady() {
        if (vehicle.id != nil) {
            self.start()
        }
    }
    
    func start() {
        // open websocket
        self.api = openApi()
        
        // start logging
        self.lm.startUpdatingLocation()
        self.lm.startUpdatingHeading()
    }
    
    func openApi() -> WebApi.Vehicles.WSController {
        var controller = WebApi.Vehicles.ws(vehicle)
        controller.setCallback({ json in
            self.vehicle.update(json["data"])
        })
        return controller
    }
    
    func stop() {
        // stop logging
        self.lm.stopUpdatingLocation()
        self.lm.stopUpdatingHeading()
        
        // close websocket
        self.api?.close()
        self.api = nil
    }
    
    func locationManager(manager: CLLocationManager, didUpdateToLocation newLocation: CLLocation, fromLocation oldLocation: CLLocation) {
        let latitude = Double(newLocation.coordinate.latitude)
        let longitude = Double(newLocation.coordinate.longitude)
        let velocity = newLocation.speed
        
        self.vehicle.location.lat = latitude;
        self.vehicle.location.lon = longitude;
        self.vehicle.velocity = velocity;
        
        self.updateRemote()
    }
    
    func locationManager(manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        let angle = Double(newHeading.magneticHeading) / 180.0 * M_PI
        
        self.vehicle.angle = angle
        
        self.updateRemote()
    }
    
    func locationManager(manager: CLLocationManager, didFailWithError error: NSError) {
        print("Error \(error)")
    }
    
    func updateRemote() {
        self.api?.update(self.vehicle)
    }
    
}
