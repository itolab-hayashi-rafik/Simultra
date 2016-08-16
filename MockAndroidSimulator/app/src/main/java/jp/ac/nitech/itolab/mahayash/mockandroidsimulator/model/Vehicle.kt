package jp.ac.nitech.itolab.mahayash.mockandroidsimulator.model

import jp.ac.nitech.itolab.mahayash.mockandroidsimulator.model.Location
import org.json.JSONObject

/**
 * Created by masayuki on 16/08/2016.
 */
class Vehicle(type: String, latitude: Double, longitude: Double) {
    var id: String? = null
    var type: String = type
    var location: Location = Location(latitude, longitude)
    var velocity: Number = 0.0
    var angle: Number = 0.0
    var wheel: Number = 0.0

    fun toJson(): JSONObject {
        val root = JSONObject()
        if (id != null) root.put("id", id)
        root.put("type", type)
        root.put("location", location.toJson())
        root.put("velocity", velocity)
        root.put("angle", angle)
        root.put("wheel", wheel)
        return root
    }

    fun update(json: JSONObject) {
        id = json["id"] as String
        type = json["type"] as String
        location.update(json["location"] as JSONObject)
        velocity = json["velocity"] as Number
        angle = json["angle"] as Number
        wheel = json["wheel"] as Number
    }
}
