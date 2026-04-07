<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$stations = [
    ["name" => "Central Fire Brigade (Lohiya Nagar)", "lat" => 18.5065396, "lng" => 73.8656903],
    ["name" => "Aundh Fire Station", "lat" => 18.5606921, "lng" => 73.8142792],
    ["name" => "Kothrud Fire Station", "lat" => 18.4990632, "lng" => 73.8134913],
    ["name" => "Yerwada Fire Station", "lat" => 18.5502944, "lng" => 73.8791084],
    ["name" => "Camp Fire Station (Moledina Rd)", "lat" => 18.5203840, "lng" => 73.8731176],
    ["name" => "Dayaram Rajguru Fire Station", "lat" => 18.5299150, "lng" => 73.8706020],
    ["name" => "Kasba Peth Fire Station", "lat" => 18.5216312, "lng" => 73.8569992],
    ["name" => "Dandekar Pool Fire Station", "lat" => 18.4996141, "lng" => 73.8478724],
    ["name" => "Pashan Fire Station", "lat" => 18.5403089, "lng" => 73.8027597],
    ["name" => "Sinhgad Road Fire Station", "lat" => 18.4755075, "lng" => 73.8156184],
    ["name" => "Katraj Fire Station", "lat" => 18.4549341, "lng" => 73.8570094],
    ["name" => "Amanora Fire Station (Hadapsar)", "lat" => 18.5147822, "lng" => 73.9453898],
    ["name" => "Nanded City Fire Station", "lat" => 18.4602641, "lng" => 73.7966310]
];

$query = isset($_GET['q']) ? strtolower($_GET['q']) : "";

if ($query !== "") {
    $stations = array_values(array_filter($stations, function ($station) use ($query) {
        return strpos(strtolower($station['name']), $query) !== false;
    }));
}

echo json_encode($stations);
?>