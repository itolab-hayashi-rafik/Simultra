package jp.ac.nitech.itolab.mahayash.mockandroidsimulator

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.location.LocationManager
import android.location.LocationProvider
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.os.PersistableBundle
import android.support.v4.app.ActivityCompat
import android.util.Log
import android.view.animation.Animation
import android.view.animation.RotateAnimation
import android.widget.ImageView
import android.widget.TextView
import com.neovisionaries.ws.client.*
import jp.ac.nitech.itolab.mahayash.mockandroidsimulator.Helper
import jp.ac.nitech.itolab.mahayash.mockandroidsimulator.WebAPI
import jp.ac.nitech.itolab.mahayash.mockandroidsimulator.model.Vehicle
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock

class MainActivity : AppCompatActivity(), Helper.LocationListener, Helper.CompassListener {

    companion object {
        val TAG: String = "MainActivity"
        val REQUEST_PERMISSION: Int = 100
        val COMPASS_MIN_INTERVAL: Long = 500
        val vehicle: Vehicle = Vehicle("veyron", 0.0, 0.0)
        val lock = ReentrantLock()
    }

    private var permissionGranted: Boolean = false
    private var remoteReady: Boolean = false
    private var locationManager: LocationManager? = null
    private var webSocket: WebSocket? = null
    private var helper: Helper? = null

    private var currentDegrees: Float = 0F
    private var lastUpdate: Long = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        helper = Helper(this)

        setupLocationManager()
        setupVehicle()
    }

    fun setupLocationManager() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        || ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            permissionGranted = true
        } else {
            ActivityCompat.requestPermissions(this, Array<String>(1, { Manifest.permission.ACCESS_FINE_LOCATION}), REQUEST_PERMISSION)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        if (requestCode == REQUEST_PERMISSION) {
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                permissionGranted = true
                startIfReady()
            }
        } else {
            super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        }
    }

    fun setupVehicle() {
        WebAPI.Vehicles
                .createNew(vehicle)
                .success{ json ->
                    vehicle.update(json)
                    connectWebSocket()
                }
                .failure { e ->
                    Log.e(TAG, "error", e)
                }
    }

    fun connectWebSocket() {
        webSocket = WebAPI.Vehicles.ws(vehicle.id!!)
        webSocket?.addListener(object : WebSocketAdapter() {
            override fun onConnected(websocket: WebSocket?, headers: MutableMap<String, MutableList<String>>?) {
                Log.i(TAG, "onConntected")
                remoteReady = true
                runOnUiThread { startIfReady() }
            }

            override fun onTextMessage(websocket: WebSocket?, text: String?) {
                Log.d(TAG, "onTextMessage: " + text)
                vehicle.update(JSONObject(text)["data"] as JSONObject)
                runOnUiThread { updateView() }
            }

            override fun onDisconnected(websocket: WebSocket?, serverCloseFrame: WebSocketFrame?, clientCloseFrame: WebSocketFrame?, closedByServer: Boolean) {
                Log.i(TAG, "onDisconntected")
                remoteReady = false
                runOnUiThread { stopIfNeeded() }
            }

            override fun onError(websocket: WebSocket?, cause: WebSocketException?) {
                Log.e(TAG, "onError", cause)
            }
        })
        webSocket?.connect()
    }

    override fun onStart() {
        super.onStart()
        startIfReady()
    }

    override fun onStop() {
        super.onStop()
        stopIfNeeded()
    }

    fun startIfReady() {
        if (permissionGranted && remoteReady) {
            startLocationUpdate()
        }
    }

    fun stopIfNeeded() {
        if (locationManager != null) {
            stopLocationUpdate()
        }
    }

    fun startLocationUpdate() {
        helper?.registerLocationListener(this)
        helper?.registerCompassListener(COMPASS_MIN_INTERVAL, this)
        Log.i(TAG, "Started")
    }

    fun stopLocationUpdate() {
        helper?.unregisterLocationListener(this)
        helper?.unregisterCompassListener(this)
        Log.i(TAG, "Stopped")
    }

    fun updateRemote() {
        webSocket?.sendText(vehicle.toJson().toString())
    }

    fun updateView() {
        val now = System.currentTimeMillis()

        (findViewById(R.id.tvId) as TextView).text = vehicle.id
        (findViewById(R.id.tvLatitude) as TextView).text = vehicle.location.latitude.toString()
        (findViewById(R.id.tvLongitude) as TextView).text = vehicle.location.longitude.toString()
        (findViewById(R.id.tvVelocity) as TextView).text = vehicle.velocity.toString()

        val degree = Math.toDegrees(vehicle.angle.toDouble()).toFloat()
        val anim = RotateAnimation(currentDegrees, -degree, Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f)
        anim.duration = if (0 < lastUpdate) (now - lastUpdate) else COMPASS_MIN_INTERVAL
        anim.fillBefore = true
        anim.fillAfter = true
        (findViewById(R.id.ivCompass) as ImageView).startAnimation(anim);
        currentDegrees = -degree

        lastUpdate = now
    }

    // --- BEGIN SNIPPET: location-listener
    override fun onLocationChanged(latitude: Double, longitude: Double, velocity: Double) {
        lock.withLock {
            vehicle.location.latitude = latitude
            vehicle.location.longitude = longitude
            vehicle.velocity = velocity
        }

        updateRemote()
    }
    // --- END SNIPPET: location-listener


    // --- BEGIN SNIPPET: compass-listener
    override fun onOrientationChanged(yaw: Float, pitch: Float, roll: Float) {
        lock.withLock {
            vehicle.angle = yaw.toDouble()
        }

        updateRemote()
    }
    // --- END SNIPPET: location-listener

}
