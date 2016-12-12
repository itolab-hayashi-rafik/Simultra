package jp.ac.nitech.itolab.mahayash.mockandroidsimulator

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.location.LocationManager
import android.os.Bundle
import android.util.Log

/**
 * Created by masayuki on 16/08/2016.
 */
class Helper(private val context: Context) {

    private val locationManager: LocationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    private val sensorManager: SensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val locationMap: MutableMap<LocationListener, android.location.LocationListener> = mutableMapOf()
    private val compassMap: MutableMap<CompassListener, SensorEventListener> = mutableMapOf()

    fun registerLocationListener(listener: LocationListener) {
        val locationListener = object : android.location.LocationListener {
            override fun onLocationChanged(location: Location?) {
                Log.i(MainActivity.TAG, "onLocationChanged: location = " + location)
                listener.onLocationChanged(location?.latitude!!, location?.longitude!!, location?.speed!!.toDouble())
            }

            override fun onProviderDisabled(provider: String?) {
                Log.i(MainActivity.TAG, "onProviderDisabled: provider = " + provider)
            }

            override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {
                Log.i(MainActivity.TAG, "onStatusChanged: provider = " + provider + ", status = " + status + ", extras = " + extras)
            }

            override fun onProviderEnabled(provider: String?) {
                Log.i(MainActivity.TAG, "onProviderEnabled: provider = " + provider)
            }
        }
        locationMap.put(listener, locationListener)

        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0L, 0F, locationListener)
        locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0L, 0F, locationListener)
    }

    fun unregisterLocationListener(listener: LocationListener) {
        if (locationMap.containsKey(listener)) {
            locationManager.removeUpdates(locationMap.remove(listener))
        }
    }

    fun registerCompassListener(minInterval: Long, listener: CompassListener) {
        unregisterCompassListener(listener)

        val eventListener = object : SensorEventListener {
            private val MATRIX_SIZE = 16
            private var inR = FloatArray(MATRIX_SIZE)
            private var outR = FloatArray(MATRIX_SIZE)
            private var I = FloatArray(MATRIX_SIZE)

            private var magneticValues: FloatArray? = null
            private var accelerometerValues: FloatArray? = null
            private var orientationValues: FloatArray = FloatArray(3)

            private var lastUpdate: Long = 0

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
                Log.i(MainActivity.TAG, "onAccuracyChanged: sensor = " + sensor + ", accuracy = " + accuracy)
            }

            override fun onSensorChanged(event: SensorEvent?) {
                if (event?.sensor!!.type == Sensor.TYPE_MAGNETIC_FIELD) {
                    magneticValues = event?.values!!.clone()
                } else if (event?.sensor!!.type == Sensor.TYPE_ACCELEROMETER) {
                    accelerometerValues = event?.values!!.clone()
                }

                if (magneticValues != null && accelerometerValues != null) {
                    val now = System.currentTimeMillis()

                    if (minInterval < now - lastUpdate) {
                        SensorManager.getRotationMatrix(inR, I, accelerometerValues, magneticValues)
                        SensorManager.getOrientation(inR, orientationValues)
                        listener.onOrientationChanged(orientationValues[0], orientationValues[1], orientationValues[2])
                        lastUpdate = now
                    }
                }
            }
        }
        compassMap.put(listener, eventListener)

        sensorManager.registerListener(eventListener, sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD), SensorManager.SENSOR_DELAY_NORMAL)
        sensorManager.registerListener(eventListener, sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), SensorManager.SENSOR_DELAY_NORMAL)
    }

    fun unregisterCompassListener(listener: CompassListener) {
        if (compassMap.containsKey(listener)) {
            sensorManager.unregisterListener(compassMap.remove(listener))
        }
    }

    interface LocationListener {
        fun onLocationChanged(latitude: Double, longitude: Double, velocity: Double)
    }

    interface CompassListener {
        fun onOrientationChanged(yaw: Float, pitch: Float, roll: Float)
    }
}
