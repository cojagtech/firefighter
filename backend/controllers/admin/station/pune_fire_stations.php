<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$stations = [
    ["name" => "Central Fire Brigade Pune", "lat" => 18.506453, "lng" => 73.865253],
    ["name" => "Katraj Fire Station Pune", "lat" => 18.454919200249957, "lng" => 73.85691076631967],
    ["name" => "Kasba Fire Station", "lat" => 18.522394, "lng" =>  73.856602], 
    ["name" => "Kondhwa Khurd Fire Station", "lat" => 18.480530, "lng" => 73.891470], 
    ["name" => "Hadapsar Fire Station", "lat" => 18.512236, "lng" => 73.915089],
    ["name" => "Warje Fire Station", "lat" => 18.483330, "lng" => 73.802874],
    ["name" => "Yerawada Fire Station", "lat" => 18.550397, "lng" => 73.879082],
    ["name" => "Baner Fire Station", "lat" => 18.560381, "lng" => 73.776903]
];

$query = isset($_GET['q']) ? strtolower($_GET['q']) : "";

if ($query !== "") {
    $stations = array_values(array_filter($stations, function ($station) use ($query) {
        return strpos(strtolower($station['name']), $query) !== false;
    }));
}

echo json_encode($stations);
?>
