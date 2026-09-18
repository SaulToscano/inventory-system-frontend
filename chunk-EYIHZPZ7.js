import{a as te,b as ae}from"./chunk-CVPC5TQA.js";import{a as X}from"./chunk-T2R27JRG.js";import{a as ie,b as re}from"./chunk-YZYUMMDO.js";import{k as ne}from"./chunk-N2RVLDUT.js";import{$a as k,Ac as b,Bb as O,Cb as h,Db as l,Eb as d,Kb as H,La as v,Lb as q,M as w,Ma as P,Md as y,N as S,P as B,Pa as N,Pd as Y,Qa as F,R as c,Ra as x,Rd as Z,Sd as ee,Tb as $,Td as g,Vb as G,W as M,X as D,Xa as u,Xb as E,_a as j,ba as T,dc as J,eb as m,fb as i,gb as r,hb as f,ka as I,ob as L,qb as V,rb as p,sb as U,sc as K,tb as R,uc as Q,wa as A,xc as W,ya as s,yb as C}from"./chunk-QRAOPB3N.js";var oe=`
    .p-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: dt('avatar.width');
        height: dt('avatar.height');
        font-size: dt('avatar.font.size');
        background: dt('avatar.background');
        color: dt('avatar.color');
        border-radius: dt('avatar.border.radius');
    }

    .p-avatar-image {
        background: transparent;
    }

    .p-avatar-circle {
        border-radius: 50%;
    }

    .p-avatar-circle img {
        border-radius: 50%;
    }

    .p-avatar-icon {
        font-size: dt('avatar.icon.size');
        width: dt('avatar.icon.size');
        height: dt('avatar.icon.size');
    }

    .p-avatar img {
        width: 100%;
        height: 100%;
    }

    .p-avatar-lg {
        width: dt('avatar.lg.width');
        height: dt('avatar.lg.width');
        font-size: dt('avatar.lg.font.size');
    }

    .p-avatar-lg .p-avatar-icon {
        font-size: dt('avatar.lg.icon.size');
        width: dt('avatar.lg.icon.size');
        height: dt('avatar.lg.icon.size');
    }

    .p-avatar-xl {
        width: dt('avatar.xl.width');
        height: dt('avatar.xl.width');
        font-size: dt('avatar.xl.font.size');
    }

    .p-avatar-xl .p-avatar-icon {
        font-size: dt('avatar.xl.icon.size');
        width: dt('avatar.xl.icon.size');
        height: dt('avatar.xl.icon.size');
    }

    .p-avatar-group {
        display: flex;
        align-items: center;
    }

    .p-avatar-group .p-avatar + .p-avatar {
        margin-inline-start: dt('avatar.group.offset');
    }

    .p-avatar-group .p-avatar {
        border: 2px solid dt('avatar.group.border.color');
    }

    .p-avatar-group .p-avatar-lg + .p-avatar-lg {
        margin-inline-start: dt('avatar.lg.group.offset');
    }

    .p-avatar-group .p-avatar-xl + .p-avatar-xl {
        margin-inline-start: dt('avatar.xl.group.offset');
    }
`;var ue=["*"];function fe(e,a){if(e&1&&(i(0,"span",3),l(1),r()),e&2){let t=p();h(t.cx("label")),m("pBind",t.ptm("label")),u("data-p",t.dataP),s(),d(t.label)}}function ge(e,a){if(e&1&&f(0,"span",5),e&2){let t=p(2);h(t.icon),m("pBind",t.ptm("icon"))("ngClass",t.cx("icon")),u("data-p",t.dataP)}}function ve(e,a){if(e&1&&x(0,ge,1,5,"span",4),e&2){let t=p(),o=C(5);m("ngIf",t.icon)("ngIfElse",o)}}function xe(e,a){if(e&1){let t=L();i(0,"img",7),V("error",function(n){M(t);let _=p(2);return D(_.imageError(n))}),r()}if(e&2){let t=p(2);m("pBind",t.ptm("image"))("src",t.image,A),u("aria-label",t.ariaLabel)("data-p",t.dataP)}}function he(e,a){if(e&1&&x(0,xe,1,4,"img",6),e&2){let t=p();m("ngIf",t.image)}}var be={root:({instance:e})=>["p-avatar p-component",{"p-avatar-image":e.image!=null,"p-avatar-circle":e.shape==="circle","p-avatar-lg":e.size==="large","p-avatar-xl":e.size==="xlarge"}],label:"p-avatar-label",icon:"p-avatar-icon"},le=(()=>{class e extends Y{name="avatar";style=oe;classes=be;static \u0275fac=(()=>{let t;return function(n){return(t||(t=I(e)))(n||e)}})();static \u0275prov=w({token:e,factory:e.\u0275fac})}return e})();var se=new B("AVATAR_INSTANCE"),z=(()=>{class e extends ee{componentName="Avatar";$pcAvatar=c(se,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=c(g,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}label;icon;image;size="normal";shape="square";styleClass;ariaLabel;ariaLabelledBy;onImageError=new T;_componentStyle=c(le);imageError(t){this.onImageError.emit(t)}get dataP(){return this.cn({[this.shape]:this.shape,[this.size]:this.size})}static \u0275fac=(()=>{let t;return function(n){return(t||(t=I(e)))(n||e)}})();static \u0275cmp=v({type:e,selectors:[["p-avatar"]],hostVars:5,hostBindings:function(o,n){o&2&&(u("aria-label",n.ariaLabel)("aria-labelledby",n.ariaLabelledBy)("data-p",n.dataP),h(n.cn(n.cx("root"),n.styleClass)))},inputs:{label:"label",icon:"icon",image:"image",size:"size",shape:"shape",styleClass:"styleClass",ariaLabel:"ariaLabel",ariaLabelledBy:"ariaLabelledBy"},outputs:{onImageError:"onImageError"},features:[H([le,{provide:se,useExisting:e},{provide:Z,useExisting:e}]),N([g]),F],ngContentSelectors:ue,decls:6,vars:2,consts:[["iconTemplate",""],["imageTemplate",""],[3,"pBind","class",4,"ngIf","ngIfElse"],[3,"pBind"],[3,"pBind","class","ngClass",4,"ngIf","ngIfElse"],[3,"pBind","ngClass"],[3,"pBind","src","error",4,"ngIf"],[3,"error","pBind","src"]],template:function(o,n){if(o&1&&(U(),R(0),x(1,fe,2,5,"span",2)(2,ve,1,2,"ng-template",null,0,E)(4,he,1,1,"ng-template",null,1,E)),o&2){let _=C(3);s(),m("ngIf",n.label)("ngIfElse",_)}},dependencies:[b,K,Q,y,g],encapsulation:2,changeDetection:0})}return e})(),pe=(()=>{class e{static \u0275fac=function(o){return new(o||e)};static \u0275mod=P({type:e});static \u0275inj=S({imports:[z,y,y]})}return e})();var _e=()=>({width:"6rem",height:"6rem","font-size":"3rem"});function Ie(e,a){e&1&&f(0,"p-skeleton",3)(1,"p-skeleton",4)(2,"p-skeleton",5)}function Ce(e,a){if(e&1&&(f(0,"p-avatar",6),i(1,"h2",7),l(2,"Mi Perfil"),r(),i(3,"p",8),l(4),r(),i(5,"div",9)(6,"h3",10),l(7,"Detalles de la Cuenta"),r(),i(8,"div",11)(9,"div",12)(10,"span",13),l(11,"ID de Usuario:"),r(),i(12,"span",14),l(13),r()(),i(14,"div",12)(15,"span",13),l(16,"\xDAltimo inicio de sesi\xF3n:"),r(),i(17,"span",14),l(18),$(19,"date"),r()(),i(20,"div",12)(21,"span",13),l(22,"Proveedor:"),r(),i(23,"span",15),l(24),r()()()()),e&2){let t=p();O(q(9,_e)),s(4),d(t.user==null?null:t.user.email),s(9),d(t.user==null?null:t.user.id),s(5),d(G(19,6,t.user==null?null:t.user.last_sign_in_at,"medium")),s(6),d(t.user==null||t.user.app_metadata==null?null:t.user.app_metadata.provider)}}var ce=class e{authService=c(X);cdr=c(J);user=null;loading=!0;async ngOnInit(){try{let a=await this.authService.getSession();a&&a.user&&(this.user=a.user)}catch(a){console.error("Error al obtener la sesi\xF3n:",a)}finally{this.loading=!1,this.cdr.detectChanges()}}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=v({type:e,selectors:[["app-user-profile"]],decls:6,vars:1,consts:[[1,"grid","justify-content-center","mt-4"],[1,"col-12","md:col-8","lg:col-6"],[1,"flex","flex-column","align-items-center","text-center"],["shape","circle","size","6rem","styleClass","mb-4"],["width","10rem","height","2rem","styleClass","mb-2"],["width","15rem","height","1.5rem","styleClass","mb-4"],["icon","pi pi-user","size","xlarge","shape","circle","styleClass","bg-primary text-white mb-4"],[1,"m-0","mb-2","text-900","text-2xl","font-bold"],[1,"m-0","text-600","mb-4","text-lg"],[1,"w-full","text-left","border-top-1","surface-border","pt-4","mt-3"],[1,"text-xl","font-bold","text-700","mb-3"],[1,"flex","flex-column","gap-3"],[1,"flex","align-items-center","justify-content-between"],[1,"text-600","font-medium"],[1,"text-900"],[1,"text-900","capitalize"]],template:function(t,o){t&1&&(i(0,"div",0)(1,"div",1)(2,"p-card")(3,"div",2),j(4,Ie,3,0)(5,Ce,25,10),r()()()()),t&2&&(s(4),k(o.loading?4:5))},dependencies:[b,ne,ae,te,pe,z,re,ie,W],encapsulation:2})};export{ce as UserProfile};
