package jp.ac.nitech.itolab.mahayash.mockandroidsimulator.model

import org.json.JSONObject

/**
 * Created by masayuki on 16/08/2016.
 */
class Vehicle(
        var id: String?,
        var type: String,
        var location: Location,
        var velocity: Number = 0.0,
        var angle: Number = 0.0,
        var wheel: Number = 0.0
) {
    constructor(type: String, latitude: Double, longitude: Double) : this(null, type, Location(latitude, longitude))

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
