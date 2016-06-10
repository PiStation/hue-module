import * as PiStation from "../../node_modules/pistation-definitions/PiStation.ts";
import {Observable} from 'rxjs/Rx';
import {Module} from "../../app/module";
import {Server} from "../../app/server";

export class Dummy extends Module {
    static moduleId:string;

    constructor(app:Server){
        super('Dummy');
        let dummyFunction = new PiStation.Function('powerControl', [

            new PiStation.ArgumentTextbox({
                value: 'test',
                key:'power',
                label:'Power',
                required: true,
            }),
            new PiStation.ArgumentTextbox({
                key:'light',
                label:'Light',
                value:'Light 1',
                required: true,
            }),
        ]);

        let rainbowFunction = new PiStation.Function('rainbowLights', [
           new PiStation.ArgumentTextbox({
               key:'width',
               value: '100px',
               label:'Width'
           })
        ]);

        this.addFunction(dummyFunction); //register on module
        this.addFunction(rainbowFunction); //register on module
    }


    //powerControl(finishCallback: ()=>void, enabled : boolean) {
    //    //do module shit
    //    console.log('Powercontrol ran with enabled var being ', enabled);
    //    setTimeout(function() {
    //        finishCallback();
    //    }, 5000);
    //    //finishCallback();
    //    //connector433.enable();
    //}



    powerControl(args : PiStation.Argument<any>[]){
        console.log(`Called Dummy Function with arguments`, args);

        const dummyFunctionUpdates = Observable //dummy update stream from connector
            .interval(500)
            .timeInterval()
            .take(20);
        return dummyFunctionUpdates;
    }

    rainbowLights(args : any){

        const colors = [[62,35,255],
            [60,255,60],
            [255,35,98],
            [45,175,230],
            [255,0,255],
            [255,128,0]];

        var step = 0;
        //color table indices for:
        // current color left
        // next color left
        // current color right
        // next color right
        var colorIndices = [0,1,2,3];

        //transition speed
        var gradientSpeed = 0.02;

        function createGradient()
        {
            var c0_0 = colors[colorIndices[0]];
            var c0_1 = colors[colorIndices[1]];
            var c1_0 = colors[colorIndices[2]];
            var c1_1 = colors[colorIndices[3]];

            var istep = 1 - step;
            var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
            var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
            var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
            var color1 = "rgb("+r1+","+g1+","+b1+")";

            var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
            var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
            var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
            var color2 = "rgb("+r2+","+g2+","+b2+")";

            const bgobj = {background:`-webkit-gradient(linear, left top, right top, from(${color1}), to(${color2}))`};
            step += gradientSpeed;
            if ( step >= 1 )
            {
                step %= 1;
                colorIndices[0] = colorIndices[1];
                colorIndices[2] = colorIndices[3];

                //pick two new target color indices
                //do not pick the same as the current one
                colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
                colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;

            }
            return bgobj;
        }

        return Observable
            .interval(100)
            .takeUntil(Observable.interval(10000))
            .map(()=>createGradient())
            .map(gradient => `<div style="background: ${gradient.background}; height: 50px; width: ${args.width}; display: block;">test</div>`)
            .map((html) => {
                return {'value': html}
            });
    }

}