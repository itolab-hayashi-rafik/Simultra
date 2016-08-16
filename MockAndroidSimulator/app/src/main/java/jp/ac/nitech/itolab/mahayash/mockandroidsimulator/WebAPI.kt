package jp.ac.nitech.itolab.mahayash.mockandroidsimulator

import com.neovisionaries.ws.client.WebSocket
import com.neovisionaries.ws.client.WebSocketExtension
import com.neovisionaries.ws.client.WebSocketFactory
import jp.ac.nitech.itolab.mahayash.mockandroidsimulator.model.Vehicle
import okhttp3.*
import org.json.JSONObject
import java.io.IOException

/**
 * Created by masayuki on 16/08/2016.
 */
class WebAPI {
    companion object {
        val baseUrl = "http://chino.itolab.nitech.ac.jp:3000/api/v1"
        val wsBaseUrl = "ws://chino.itolab.nitech.ac.jp:3000/api/v1"

        val jsonMediaType = MediaType.parse("application/json")
    }

    class Vehicles {
        companion object {
            fun getList(): Result {
                val request = Request.Builder().url(baseUrl + "/vehicles").get().build()
                return Result(request)
            }

            fun createNew(vehicle: Vehicle): Result {
                val body = RequestBody.create(jsonMediaType, vehicle.toJson().toString())
                val request = Request.Builder().url(baseUrl + "/vehicles/new").post(body).build()
                return Result(request)
            }

            fun get(id: String): Result {
                val request = Request.Builder().url(baseUrl + "/vehicles/" + id).get().build()
                return Result(request)
            }

            fun update(id: String, vehicle: Vehicle): Result {
                val body = RequestBody.create(jsonMediaType, vehicle.toJson().toString())
                val request = Request.Builder().url(baseUrl + "/vehicles/" + id).put(body).build()
                return Result(request)
            }

            fun delete(id: String): Result {
                val request = Request.Builder().url(baseUrl + "/vehicles/" + id).delete().build()
                return Result(request)
            }

            fun ws(id: String): WebSocket {
                return WebSocketFactory()
                        .setConnectionTimeout(10000)
                        .createSocket(wsBaseUrl + "/vehicles/" + id + "/ws")
                        .addExtension(WebSocketExtension.PERMESSAGE_DEFLATE)
            }
        }
    }

    interface JsonCallback {
        fun onResponse(json: JSONObject)
        fun onFailure(e: IOException?)
    }

    interface SuccessCallback {
        fun onSuccess(json: JSONObject)
    }

    interface FailureCallback {
        fun onFailure(e: IOException?)
    }

    class Result(request: Request) {
        private var successCallback: ((JSONObject) -> Unit) = {}
        private var failureCallback: ((IOException?) -> Unit) = {}
        var request: Request = request
        var response: Response? = null

        init {
            val client = OkHttpClient.Builder().build()
            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call?, e: IOException?) {
                    failureCallback(e)
                }
                override fun onResponse(call: Call?, r: Response?) {
                    response = r
                    successCallback(JSONObject(r?.body()?.string()))
                }
            })
        }

        public fun success(callback: (JSONObject) -> Unit): Result {
            this.successCallback = callback
            return this
        }

        public fun failure(callback: (IOException?) -> Unit): Result {
            this.failureCallback = callback
            return this
        }
    }
}
