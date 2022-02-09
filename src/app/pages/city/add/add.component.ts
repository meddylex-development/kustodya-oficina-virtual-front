import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { UtilitiesService } from 'app/shared/api/services/utilities.service';
import { StateService } from 'app/shared/api/services/state.service';
import { CityService } from 'app/shared/api/services/city.service';
import { CountryService } from 'app/shared/api/services/country.service';

@Component({
  selector: 'add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  @Input() data: any;
  public token: string = '';
  public userData: any = null; 
  public submitted: boolean = false;
  public city: any = {
    'name': '',
    'description': '', 
    'idState': '',
  };

  public DATA_LANG: any = null;
  public DATA_LANG_GENERAL: any = null;
  public language: string = '';
  public nameComponent: string = 'cityComponent';
  public collectionStatesList: any = [];
  public collectionStatesListOriginal: any = [];
  public collectioncountryList: any = [];
  public collectioncountryListOriginal: any = [];
  
  constructor(
    protected ref: NbDialogRef<AddComponent>,
    private utilitiesService: UtilitiesService,
    private cityService: CityService,
    private stateService: StateService,
    private countryService: CountryService,
  ) { }

  ngOnInit(): void {
    this.language = (this.utilitiesService.fnGetBrowserLocales().length > 1) ? (this.utilitiesService.fnGetBrowserLocales()[1]).toUpperCase() : 'ES';
    // this.language = 'EN';
    this.utilitiesService.fnSetLocalStorage("lang", this.language);
    this.fnGetDataLanguages(this.language, this.nameComponent);
    this.fnGetDataGeneralLanguages(this.language);

    this.utilitiesService.fnAuthValidUser().then(response => {
      this.token = response['token'];
      this.userData = response['user'];
      this.fnGetList(this.token).then((responseState) => {
        if(responseState['body']['stateRequest']) {
          this.collectionStatesList = responseState['body']['state'];
          this.collectionStatesListOriginal = responseState['body']['state'];
        } else {
          this.collectionStatesList = []
          this.collectionStatesListOriginal = [];
        }
      });

      this.fnGetCountries(this.token).then((response) => {
        console.log('response: ', response);
        if(response['body']['stateRequest']) {
          this.collectioncountryList = response['body']['data'];
          this.collectioncountryListOriginal = response['body']['data'];
        } else {
          this.collectioncountryList = []
          this.collectioncountryListOriginal = [];
        }
      })
    }).catch(error => {
      this.utilitiesService.fnSignOutUser().then(resp => {
        this.utilitiesService.fnNavigateByUrl('auth/login');
      })
    });
  }

  fnGetDataLanguages(language, nameComponent) {
    let urlCollection = 'Languages/' + language + '/' + nameComponent;
    this.utilitiesService.fnGetDataFBCallback(urlCollection, (response) => {
      this.DATA_LANG = response;
    });
  }
  
  fnGetDataGeneralLanguages(language) {
    let urlCollection = 'GeneralLanguages/' + language;
    this.utilitiesService.fnGetDataFBCallback(urlCollection, (response) => {
      this.DATA_LANG_GENERAL = response;
    });
  }

  fnGetList(token) {
    return new Promise((resolve, reject) => {
      this.stateService.fnHttpGetStateList(token).subscribe(response => {
        const data = response['body']['state'];
        if (data.length > 0) {
          resolve(response);
        } else {
          reject(false);
        }
      });
    });
  }

  fnGetCountries(token) {
    return new Promise((resolve, reject) => {
      this.countryService.fnHttpGetCountryList(token).subscribe(response => {
        const data = response['body']['data'];
        if (data.length > 0) {
          resolve(response);
        } else {
          reject(false);
        }
      });
    });
  }

  fnSetStatusCity(data_city) {
    this.city['idState'] = data_city['_id'];
  }

  fnSetCountry(data_country) {
    this.city['idCountry'] = data_country['_id'];
  }

  fnAddData(data) {
    this.submitted = true;
    this.cityService.fnHttpSetAddNewCity(this.token, this.city).subscribe(response => {
      const data = response;
      if (data['status'] == 200) {
        this.submitted = false;
        this.utilitiesService.showToast('top-right', 'success', this.DATA_LANG['msgLblSaveSuccess']['text'], 'fas fa-check');
        this.dismiss(true);
      } else {
        this.submitted = false;
        this.utilitiesService.showToast('top-right', 'danger', this.DATA_LANG['msgLblSaveError']['text'], 'nb-alert');
        this.dismiss(false);
      }
    });
  }

  dismiss(res?) {
    this.ref.close(res);
  }

  fnCancelAddData() {
    this.dismiss();
  }

  fnCloseModal() {
    this.dismiss();
  }

}