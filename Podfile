workspace 'Simultra.xcworkspace'

xcodeproj 'MockIPhoneSimulator/MockIPhoneSimulator.xcodeproj'

target 'MockIPhoneSimulator' do
    # Comment this line if you're not using Swift and don't want to use dynamic frameworks
    use_frameworks!

    # Pods for GeoLocationTest
    pod 'Alamofire'
    pod 'SwiftyJSON'
    pod 'Starscream', '~> 1.1.3'

    target 'MockIPhoneSimulatorTests' do
        inherit! :search_paths
        # Pods for testing
    end

    target 'MockIPhoneSimulatorUITests' do
        inherit! :search_paths
        # Pods for testing
    end
end
