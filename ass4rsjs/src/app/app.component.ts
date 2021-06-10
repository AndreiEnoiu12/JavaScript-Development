import {Component} from '@angular/core';
import "rxjs/add/operator/take";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import {HttpClient} from "@angular/common/http";
import {Observable, Subscription} from "rxjs";

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    warnings: any[] = [];
    warningsObs: Observable<Object>;
    minLevel = null;
    levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    warnings_update = true;
    subscription: Subscription;

    stop_update() {
        this.warnings_update = false;
        this.subscription.unsubscribe();
    };

    start_update() {
        this.warnings_update = true;
        this.startSubscription();
    };

    process_ingest(data) {
        let parsed_data = data;
        if (parsed_data.hasOwnProperty("warnings")) {
            parsed_data.warnings.forEach((value) => this.add_single_warning(value))
        } else {
            this.add_single_warning(parsed_data);
        }
    }
    ;

    add_single_warning(warning) {
        let existing_index = this.warnings.find((existing) => {
            return existing.id === warning.id
        });
        if (existing_index) {
            if (warning.severity === 0 || (this.minLevel && warning.severity <= this.minLevel)) {
                return;
            } else {
                this.warnings[existing_index] = warning;
            }
        } else {
            if (warning.severity > 0) {
                if (this.minLevel !== null) {
                    if (warning.severity > this.minLevel) {
                        this.warnings.push(warning);
                    }
                } else {
                    this.warnings.push(warning);
                }
            }
        }
    }

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.startSubscription();
    }

    startSubscription() {
        this.warningsObs = this.getWarnings();
        this.subscription = this.warningsObs.subscribe((d) => {
            console.log(d);
            this.process_ingest(d);
        }, (e) => {
            console.log('Error', JSON.stringify(e));
        });
    }

    getWarnings() {
        return this.warningsObs = Observable.interval(1000)
            .switchMap(() => this.http.get("http://localhost:8080/warnings"))
    }
}
