package jp.ac.nitech.itolab.mahayash.mockandroidsimulator.model

import org.json.JSONObject

/**
 * Created by masayuki on 16/08/2016.
 */
class Location(latitude: Double, longitude: Double) {
    var latitude: Number = latitude
    var longitude: Number = longitude

    fun toJson(): JSONObject {
        val root = JSONObject()
        root.put("lat", latitude)
        root.put("lon", longitude)
        return root
    }

    fun update(json: JSONObject) {
        latitude = json["lat"] as Number
        longitude = json["lon"] as Number
    }
}
