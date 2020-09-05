<?php
function GMapCircle($Lat,$Lng,$Rad,$Detail=8){
    $R    = 6371;
    $pi   = pi();
    $Lat  = ($Lat * $pi) / 180;
    $Lng  = ($Lng * $pi) / 180;
    $d    = $Rad / $R;

    $points = array();
    $i = 0;

    for($i = 0; $i <= 360; $i += $Detail):
    $brng = $i * $pi / 180;
    $pLat = asin(sin($Lat)*cos($d) + cos($Lat)*sin($d)*cos($brng));
    $pLng = (($Lng + atan2(sin($brng)*sin($d)*cos($Lat), cos($d)-sin($Lat)*sin($pLat))) * 180) / $pi;
    $pLat = ($pLat * 180) /$pi;
    $points[] = array($pLat,$pLng);
    endfor;

 require_once('PolylineEncoder.php');
 $PolyEnc   = new PolylineEncoder($points);
 $EncString = $PolyEnc->dpEncode();

 return $EncString['Points'];
}

function funcStaticMapWithCircle($lat, $lng) {

    //$lat & $lng are center of circle

    $mapCentLat =   $lat + 0.002;
    $mapCentLng =   $lng - 0.011;
    $mapW =         600;
    $mapH =         600;
    $zoom =         14;

    $circRadius =       0.75;         //Radius in km
    $circRadiusThick =  1;
    $circFill =         '00BFFF';
    $circFillOpacity =  '60';
    $circBorder =       'red';

    $encString = GMapCircle($lat,$lng,$circRadius); //Encoded polyline string


    $src =  'https://maps.googleapis.com/maps/api/staticmap?';
    $src .= 'center=' .$mapCentLat. ',' .$mapCentLng. '&';
    $src .= 'zoom=' .$zoom. '&';
    $src .= 'size=' .$mapW. 'x' .$mapH.'&';
    $src .= 'maptype=roadmap&';
    $src .= 'style=feature:water|element:geometry.fill|color:0x9bd3ff&';
    $src .= 'path=';
    $src .= 'color:0x' .$circBorder. '00|';
    $src .= 'fillcolor:0x' .$circFill.$circFillOpacity. '|';
    $src .= 'weight:' .$circRadiusThick. '|';
    $src .= 'enc:' .$encString;

    return $src;
}
?>