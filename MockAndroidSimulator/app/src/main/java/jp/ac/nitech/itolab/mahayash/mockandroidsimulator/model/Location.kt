package jp.ac.nitech.itolab.mahayash.mockandroidsimulator.model

import org.json.JSONObject

/**
 * Created by masayuki on 16/08/2016.
 */
data class Location(
        var latitude: Number,
        var longitude: Number
) {
    constructor(latitude: Double, longitude: Double) : this(latitude as Number, longitude as Number)

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
