function Profile(){
	this.id;
    this.gebruikersnaam;
    this.wachtwoord;
    this.email;
    this.profielfoto;
    this.rating;
    this.hondnaam;
    this.hondras;
    this.locatie;
    this.status;

	//this.mijnActiviteiten;
    this.opgeslagenActiviteiten;

      
    this.CreatedAt;
    this.UpdatedAt;
    this.DeletedAt;
}

function Activiteit(){
	this.id;
	this.status;
	this.locatie;
	this.lat;
	this.lng;

	this.gebruikerId;
	this.gebruikerNaam;
	this.gebruikerHond;
	this.gebruikerRas;

	this.startDatum;
	this.startUur;
	this.stopDatum;
	this.stopUur;
	this.herhaling;

	this.acceptorId;

	this.CreatedAt;
	this.DeletedAt;
}


function Markers(){
	this.id;
	this.lat;
	this.lng;
}